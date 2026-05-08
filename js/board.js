/**
 * 游戏棋盘系统
 * 处理元素匹配、消除、下落等核心逻辑
 */

(function() {
  'use strict';
  
  // 棋盘配置
  const config = {
    cellSize: 48,
    padding: 10,
    rows: 8,
    cols: 8,
    animationDuration: 200
  };
  
  // 棋盘状态
  let board = [];
  let selectedCell = null;
  let isAnimating = false;
  let combo = 0;
  let score = 0;
  let moves = 0;
  let currentTheme = 'candy';
  let currentLevel = 1;
  
  // 元素类型
  let elementTypes = [];
  
  // 回调函数
  let callbacks = {
    onMatch: null,
    onScoreChange: null,
    onMovesChange: null,
    onLevelComplete: null,
    onLevelFail: null,
    onCombo: null
  };
  
  // 初始化棋盘
  function init(level, theme) {
    currentLevel = level;
    currentTheme = theme;
    
    const levelConfig = window.Themes ? window.Themes.getLevelConfig(level) : null;
    
    if (levelConfig) {
      config.rows = levelConfig.boardSize;
      config.cols = levelConfig.boardSize;
      moves = levelConfig.moves;
      elementTypes = window.Themes.getThemeConfig(theme).elements;
    } else {
      moves = 25;
      elementTypes = ['red', 'orange', 'yellow', 'green', 'blue', 'purple'];
    }
    
    score = 0;
    combo = 0;
    selectedCell = null;
    isAnimating = false;
    
    // 创建棋盘
    createBoard();
    
    // 确保没有初始匹配
    while (findMatches().length > 0) {
      createBoard();
    }
    
    // 触发回调
    if (callbacks.onScoreChange) callbacks.onScoreChange(score);
    if (callbacks.onMovesChange) callbacks.onMovesChange(moves);
    
    return getBoardState();
  }
  
  // 创建棋盘
  function createBoard() {
    board = [];
    
    for (let row = 0; row < config.rows; row++) {
      board[row] = [];
      for (let col = 0; col < config.cols; col++) {
        board[row][col] = createCell(row, col);
      }
    }
  }
  
  // 创建单元格
  function createCell(row, col) {
    return {
      row,
      col,
      type: elementTypes[Math.floor(Math.random() * elementTypes.length)],
      special: null, // 'striped_h', 'striped_v', 'wrapped', 'bomb'
      x: col * config.cellSize + config.padding,
      y: row * config.cellSize + config.padding,
      targetX: col * config.cellSize + config.padding,
      targetY: row * config.cellSize + config.padding,
      scale: 1,
      alpha: 1,
      selected: false
    };
  }
  
  // 获取棋盘状态
  function getBoardState() {
    return {
      board: board.map(row => row.map(cell => ({ ...cell }))),
      score,
      moves,
      combo,
      rows: config.rows,
      cols: config.cols,
      cellSize: config.cellSize,
      padding: config.padding
    };
  }
  
  // 处理点击
  function handleClick(x, y) {
    if (isAnimating) return null;
    
    const col = Math.floor((x - config.padding) / config.cellSize);
    const row = Math.floor((y - config.padding) / config.cellSize);
    
    if (row < 0 || row >= config.rows || col < 0 || col >= config.cols) {
      return null;
    }
    
    const cell = board[row][col];
    if (!cell || !cell.type) return null;
    
    if (selectedCell === null) {
      // 第一次选择
      selectedCell = { row, col };
      cell.selected = true;
      
      // 播放音效
      if (window.Sound) window.Sound.playSound('click');
      
      // 震动反馈
      if (window.WX && window.WX.vibrate) window.WX.vibrate.short();
      
      return { type: 'select', cell };
    } else {
      // 第二次选择
      const prevCell = board[selectedCell.row][selectedCell.col];
      prevCell.selected = false;
      
      // 检查是否相邻
      const isAdjacent = (
        (Math.abs(selectedCell.row - row) === 1 && selectedCell.col === col) ||
        (Math.abs(selectedCell.col - col) === 1 && selectedCell.row === row)
      );
      
      if (isAdjacent) {
        // 尝试交换
        return trySwap(selectedCell.row, selectedCell.col, row, col);
      } else {
        // 选择新的单元格
        selectedCell = { row, col };
        cell.selected = true;
        
        if (window.Sound) window.Sound.playSound('click');
        
        return { type: 'select', cell };
      }
    }
  }
  
  // 尝试交换
  function trySwap(row1, col1, row2, col2) {
    selectedCell = null;
    
    // 交换元素
    swapCells(row1, col1, row2, col2);
    
    // 检查是否有匹配
    const matches = findMatches();
    
    if (matches.length > 0) {
      // 有效移动
      moves--;
      if (callbacks.onMovesChange) callbacks.onMovesChange(moves);
      
      // 播放移动音效
      if (window.Sound) window.Sound.playSound('move');
      
      // 处理匹配
      return processMatches(matches);
    } else {
      // 无效移动，交换回来
      swapCells(row1, col1, row2, col2);
      
      // 播放无效音效
      if (window.Sound) window.Sound.playSound('invalid');
      
      return { type: 'invalid' };
    }
  }
  
  // 交换单元格
  function swapCells(row1, col1, row2, col2) {
    const temp = board[row1][col1];
    board[row1][col1] = board[row2][col2];
    board[row2][col2] = temp;
    
    // 更新位置
    board[row1][col1].row = row1;
    board[row1][col1].col = col1;
    board[row2][col2].row = row2;
    board[row2][col2].col = col2;
  }
  
  // 查找匹配
  function findMatches() {
    const matches = [];
    const matched = new Set();
    
    // 检查水平匹配
    for (let row = 0; row < config.rows; row++) {
      for (let col = 0; col < config.cols - 2; col++) {
        const type = board[row][col].type;
        if (!type) continue;
        
        let matchLength = 1;
        while (col + matchLength < config.cols && board[row][col + matchLength].type === type) {
          matchLength++;
        }
        
        if (matchLength >= 3) {
          const match = {
            type: 'horizontal',
            cells: [],
            length: matchLength
          };
          
          for (let i = 0; i < matchLength; i++) {
            const key = `${row},${col + i}`;
            if (!matched.has(key)) {
              matched.add(key);
              match.cells.push({ row, col: col + i });
            }
          }
          
          if (match.cells.length >= 3) {
            matches.push(match);
          }
          
          col += matchLength - 1;
        }
      }
    }
    
    // 检查垂直匹配
    for (let col = 0; col < config.cols; col++) {
      for (let row = 0; row < config.rows - 2; row++) {
        const type = board[row][col].type;
        if (!type) continue;
        
        let matchLength = 1;
        while (row + matchLength < config.rows && board[row + matchLength][col].type === type) {
          matchLength++;
        }
        
        if (matchLength >= 3) {
          const match = {
            type: 'vertical',
            cells: [],
            length: matchLength
          };
          
          for (let i = 0; i < matchLength; i++) {
            const key = `${row + i},${col}`;
            if (!matched.has(key)) {
              matched.add(key);
              match.cells.push({ row: row + i, col });
            }
          }
          
          if (match.cells.length >= 3) {
            matches.push(match);
          }
          
          row += matchLength - 1;
        }
      }
    }
    
    return matches;
  }
  
  // 处理匹配
  function processMatches(matches) {
    isAnimating = true;
    combo++;
    
    // 计算得分
    let matchScore = 0;
    const allMatchedCells = [];
    
    matches.forEach(match => {
      match.cells.forEach(cell => {
        allMatchedCells.push(cell);
        
        // 基础分数
        matchScore += 10;
        
        // 特殊糖果额外分数
        const boardCell = board[cell.row][cell.col];
        if (boardCell.special) {
          matchScore += 40;
        }
      });
      
      // 匹配长度奖励
      if (match.length === 4) matchScore += 20;
      if (match.length >= 5) matchScore += 50;
    });
    
    // 连击加成
    matchScore = window.Shop ? window.Shop.calculateScore(matchScore, combo) : matchScore;
    
    score += matchScore;
    if (callbacks.onScoreChange) callbacks.onScoreChange(score);
    
    // 触发连击回调
    if (combo > 1 && callbacks.onCombo) {
      callbacks.onCombo(combo);
    }
    
    // 播放消除音效
    if (window.Sound) {
      window.Sound.playSound('match');
      if (combo > 1) {
        window.Sound.playSound('combo', combo);
      }
    }
    
    // 创建粒子效果
    allMatchedCells.forEach(cell => {
      const boardCell = board[cell.row][cell.col];
      if (window.Particles && boardCell.type) {
        const color = window.Themes ? 
          window.Themes.getElementColor(currentTheme, boardCell.type) : 
          '#FFFFFF';
        window.Particles.createMatchEffect(
          boardCell.x + config.cellSize / 2,
          boardCell.y + config.cellSize / 2,
          color,
          boardCell.special ? 'special' : 'normal'
        );
      }
    });
    
    // 触发匹配回调
    if (callbacks.onMatch) {
      callbacks.onMatch(allMatchedCells, matchScore, combo);
    }
    
    // 检查是否创建特殊糖果
    matches.forEach(match => {
      if (match.length === 4) {
        // 创建条纹糖果
        const centerCell = match.cells[Math.floor(match.cells.length / 2)];
        createSpecialCandy(centerCell.row, centerCell.col, 
          match.type === 'horizontal' ? 'striped_v' : 'striped_h');
      } else if (match.length >= 5) {
        // 创建彩色炸弹
        const centerCell = match.cells[Math.floor(match.cells.length / 2)];
        createSpecialCandy(centerCell.row, centerCell.col, 'bomb');
      }
    });
    
    // 清除匹配的单元格
    setTimeout(() => {
      removeMatchedCells(allMatchedCells);
      
      // 下落并填充
      setTimeout(() => {
        dropCells();
        fillBoard();
        
        setTimeout(() => {
          // 检查新的匹配
          const newMatches = findMatches();
          if (newMatches.length > 0) {
            processMatches(newMatches);
          } else {
            isAnimating = false;
            combo = 0;
            
            // 检查游戏状态
            checkGameState();
          }
        }, config.animationDuration);
      }, config.animationDuration);
    }, config.animationDuration);
    
    return {
      type: 'match',
      matches,
      score: matchScore,
      combo
    };
  }
  
  // 创建特殊糖果
  function createSpecialCandy(row, col, specialType) {
    if (board[row] && board[row][col]) {
      board[row][col].special = specialType;
    }
  }
  
  // 移除匹配的单元格
  function removeMatchedCells(cells) {
    cells.forEach(cell => {
      if (board[cell.row] && board[cell.row][cell.col]) {
        // 检查特殊糖果效果
        const special = board[cell.row][cell.col].special;
        
        if (special === 'striped_h') {
          // 消除整行
          for (let c = 0; c < config.cols; c++) {
            if (board[cell.row][c]) {
              board[cell.row][c].type = null;
            }
          }
        } else if (special === 'striped_v') {
          // 消除整列
          for (let r = 0; r < config.rows; r++) {
            if (board[r] && board[r][cell.col]) {
              board[r][cell.col].type = null;
            }
          }
        } else if (special === 'wrapped') {
          // 消除周围3x3
          for (let r = cell.row - 1; r <= cell.row + 1; r++) {
            for (let c = cell.col - 1; c <= cell.col + 1; c++) {
              if (r >= 0 && r < config.rows && c >= 0 && c < config.cols && board[r][c]) {
                board[r][c].type = null;
              }
            }
          }
        } else if (special === 'bomb') {
          // 消除所有同色
          const targetType = board[cell.row][cell.col].type;
          for (let r = 0; r < config.rows; r++) {
            for (let c = 0; c < config.cols; c++) {
              if (board[r][c] && board[r][c].type === targetType) {
                board[r][c].type = null;
              }
            }
          }
        }
        
        board[cell.row][cell.col].type = null;
        board[cell.row][cell.col].special = null;
      }
    });
  }
  
  // 下落单元格
  function dropCells() {
    for (let col = 0; col < config.cols; col++) {
      let emptyRow = config.rows - 1;
      
      for (let row = config.rows - 1; row >= 0; row--) {
        if (board[row][col].type) {
          if (row !== emptyRow) {
            // 移动到空位
            board[emptyRow][col].type = board[row][col].type;
            board[emptyRow][col].special = board[row][col].special;
            board[row][col].type = null;
            board[row][col].special = null;
          }
          emptyRow--;
        }
      }
    }
  }
  
  // 填充棋盘
  function fillBoard() {
    for (let col = 0; col < config.cols; col++) {
      for (let row = 0; row < config.rows; row++) {
        if (!board[row][col].type) {
          board[row][col].type = elementTypes[Math.floor(Math.random() * elementTypes.length)];
          board[row][col].special = null;
        }
      }
    }
  }
  
  // 检查游戏状态
  function checkGameState() {
    const levelConfig = window.Themes ? window.Themes.getLevelConfig(currentLevel) : null;
    
    if (!levelConfig) return;
    
    // 检查是否达成目标
    if (score >= levelConfig.starScores[0]) {
      // 计算星级
      let stars = 1;
      if (score >= levelConfig.starScores[1]) stars = 2;
      if (score >= levelConfig.starScores[2]) stars = 3;
      
      if (callbacks.onLevelComplete) {
        callbacks.onLevelComplete(stars, score);
      }
    } else if (moves <= 0) {
      // 游戏失败
      if (callbacks.onLevelFail) {
        callbacks.onLevelFail(score);
      }
    }
  }
  
  // 使用道具
  function useItem(itemId, row, col) {
    if (!window.Shop) return false;
    
    const result = window.Shop.useItem(itemId);
    if (!result.success) return false;
    
    switch (itemId) {
      case 'hammer':
        // 锤子：消除单个元素
        if (board[row] && board[row][col]) {
          const cell = board[row][col];
          if (window.Particles) {
            const color = window.Themes ? 
              window.Themes.getElementColor(currentTheme, cell.type) : '#FFFFFF';
            window.Particles.createMatchEffect(
              cell.x + config.cellSize / 2,
              cell.y + config.cellSize / 2,
              color
            );
          }
          cell.type = null;
          cell.special = null;
          dropCells();
          fillBoard();
        }
        break;
        
      case 'bomb':
        // 炸弹：消除3x3范围
        for (let r = row - 1; r <= row + 1; r++) {
          for (let c = col - 1; c <= col + 1; c++) {
            if (r >= 0 && r < config.rows && c >= 0 && c < config.cols && board[r][c]) {
              const cell = board[r][c];
              if (window.Particles && cell.type) {
                const color = window.Themes ? 
                  window.Themes.getElementColor(currentTheme, cell.type) : '#FFFFFF';
                window.Particles.createMatchEffect(
                  cell.x + config.cellSize / 2,
                  cell.y + config.cellSize / 2,
                  color
                );
              }
              cell.type = null;
              cell.special = null;
            }
          }
        }
        dropCells();
        fillBoard();
        break;
        
      case 'refresh':
        // 刷新：重新排列
        const allTypes = [];
        board.forEach(row => row.forEach(cell => {
          if (cell.type) allTypes.push({ type: cell.type, special: cell.special });
        }));
        
        // 打乱
        for (let i = allTypes.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [allTypes[i], allTypes[j]] = [allTypes[j], allTypes[i]];
        }
        
        // 重新分配
        let index = 0;
        board.forEach(row => row.forEach(cell => {
          if (index < allTypes.length) {
            cell.type = allTypes[index].type;
            cell.special = allTypes[index].special;
            index++;
          }
        }));
        break;
        
      case 'extra_moves':
        // +5步
        moves += 5;
        if (callbacks.onMovesChange) callbacks.onMovesChange(moves);
        break;
        
      case 'rainbow_candy':
        // 彩虹糖：消除所有同色
        if (board[row] && board[row][col]) {
          const targetType = board[row][col].type;
          for (let r = 0; r < config.rows; r++) {
            for (let c = 0; c < config.cols; c++) {
              if (board[r][c] && board[r][c].type === targetType) {
                const cell = board[r][c];
                if (window.Particles) {
                  const color = window.Themes ? 
                    window.Themes.getElementColor(currentTheme, cell.type) : '#FFFFFF';
                  window.Particles.createMatchEffect(
                    cell.x + config.cellSize / 2,
                    cell.y + config.cellSize / 2,
                    color
                  );
                }
                cell.type = null;
                cell.special = null;
              }
            }
          }
          dropCells();
          fillBoard();
        }
        break;
    }
    
    return true;
  }
  
  // 设置回调
  function setCallbacks(cbs) {
    callbacks = { ...callbacks, ...cbs };
  }
  
  // 获取配置
  function getConfig() {
    return { ...config };
  }
  
  // 设置配置
  function setConfig(newConfig) {
    Object.assign(config, newConfig);
  }
  
  // 导出全局API
  window.Board = {
    init,
    handleClick,
    getBoardState,
    useItem,
    setCallbacks,
    getConfig,
    setConfig,
    findMatches
  };
  
})();
