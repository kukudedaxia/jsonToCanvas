class Poster {
  constructor(...args) {
    this.parentNode = document.getElementById(args[0]);
    console.log(this.parentNode, 'paren')
    this.width = args[1] || 0;
    this.height = args[2] || 0;
    this.canvas = this.initCanvasContext(this.width, this.height);
    this.defaultConfig = this.setDefault(args[3] || {});
    this.inlineBlockConfig = this.setInlineBlock(this.defaultConfig, 1);
    this.widthConfig = this.setWidth(this.inlineBlockConfig);
    this.heightConfig = this.setHeight(this.widthConfig);
    this.originConfig = this.setOrigin(this.heightConfig);
    this.images = this.getImages(this.originConfig);
    this.progress = 0;
    this.boxShow = args[4] || false; //是否需要画边界
  }
  init() {
    const that = this;
    that.loadAllImages(this.images).then(res => {
      console.log(that,res, 'item', that.originConfig);
      that.drawCanvas(that.originConfig);
      that.parentNode && that.parentNode.append(that.canvas);
    });
  }
  /** 1初始化canvas  */
  initCanvasContext(width, height) {
    var canvas = document.createElement('canvas');
    canvas.id = 'canvas';
    var devicePixelRatio = window.devicePixelRatio || 1;
    var context = canvas.getContext('2d');
    var backingStoreRatio =
      context.webkitBackingStorePixelRatio ||
      context.mozBackingStorePixelRatio ||
      context.msBackingStorePixelRatio ||
      context.oBackingStorePixelRatio ||
      context.backingStorePixelRatio ||
      1;
    //获取设备像素比 canvas画布扩大， 保证能够高清显示
    var ratio = devicePixelRatio / backingStoreRatio;
    canvas.width = width * ratio;
    canvas.height = height * ratio;
    this.ctx = context;
    context.scale(ratio, ratio);
    canvas.style.transform = `scale(${1 / ratio})`;
    canvas.style.transformOrigin = 'left top';
    if (this.parentNode) {
      this.parentNode.style.width = width + 'px';
      this.parentNode.style.height = height + 'px';
    }
    return canvas;
  }
  /**
   * 2 设置一些基础默认值
   *
   * @param {*} config JSON配置
   * @return {*} canvasAndCtx 画布相关信息
   */
  setDefault(config) {
    config.custom = config.custom || this.custom.bind(this);
    config.css.padding = config.css.padding || [0, 0, 0, 0];
    // 给文字默认添加颜色,行高,最大宽度，配置
    if (config.type == 'text') {
      config.css.color = config.css.color || '#ffffff';
      if (!config.css.lineHeight) {
        let result = /\d+px/i.exec(config.css.fontSize);
        if (result) {
          config.css.lineHeight = parseFloat(result[0]);
        }
      }
      if (config.css.width) {
        config.css.maxWidth = config.css.maxWidth || config.css.width;
      }
    }
    if (config.children) {
      for (let item of config.children) {
        this.setDefault(item);
      }
    }
    return config;
  }
  /**
   * 3 setInlineBlock 方法会将连续排列的 inline-block 节点聚合新建一个空白的 div 插入原先的位置然后将这些 inline-block 节点作为 children 插入其中
   *
   * @param {*} config JSON配置 index层数（测试）
   * @return {*} canvasAndCtx 画布相关信息
   */
  setInlineBlock(config, index) {
    const arr = config.children;
    if (arr) {
      const common = []; // 二维数组整合成新的div
      const diffed = []; // 已经比较过相同的下次不进行比较
      for (let i = 0; i < arr.length; i++) {
        if (diffed.includes(i)) {
          continue;
        }
        let start = i;
        let row = [i];
        for (let j = i + 1; j < arr.length; j++) {
          if (arr[i].css.display == 'inline-block' && arr[j].css.display == 'inline-block' && j == start + 1) {
            row.push(j);
            start = j;
          }
        }
        if (row.length > 1) {
          diffed.push(...row);
          common.push(row);
        } else {
          common.push(start);
        }
      }
      // 重新递归构建结构
      const newChildren = common.map(item => {
        if (Array.isArray(item)) {
          const obj = {
            type: 'div',
            css: {
              padding: [0, 0, 0, 0],
            },
            custom: this.custom.bind(this),
            children: item.map(d => this.setInlineBlock(arr[d], ++index)),
          };
          return obj;
        }
        return this.setInlineBlock(arr[item], ++index);
      });
      config.children = newChildren;
    }
    return config;
  }
  //计算完的 width，height 会结合 margin，border 等 css 属性再次计算各种盒模型宽。
  addBoxWidth(element, boxWidth) {
    element.css.boxWidth = boxWidth;
  }
  addLayerWidth(element, layerWidth) {
    element.css.layerWidth = layerWidth;
  }
  addBoxHeight(element, boxHeight) {
    element.css.boxHeight = boxHeight;
  }
  addLayerHeight(element, layerHeight) {
    element.css.layerHeight = layerHeight;
  }
  /** 4计算所有节点的宽   */
  setWidth(config, parent) {
    // 文字可能没有宽 ，图片一定要有宽高, 宽度有最大值和继承父的宽度限定边界
    const children = config.children;
    if (!config.css.width) {
      if (config.type == 'text') {
        let width = this.getText(config).width;
        if (parent && width > parent.css.width) {
          width = parent.css.width;
        }
        if (config.css.maxWidth) {
          width = Math.max(config.css.maxWidth, width);
        }
        config.css.width = width;
      }
      // div含有字节点继承父节点的宽度
      if (config.type == 'div' && parent && config.css.display !== 'inline-block') {
        config.css.width = parent.css.width;
        if (config.children) {
          config.children.forEach(element => {
            this.setWidth(element, config);
          });
        }
      } else if (children) {
        config.css.width = children.reduce((sum, item) => {
          const res = this.setWidth(item, config);
          return sum + res.css.width;
        }, 0);
      }
    } else if (children) {
      children.forEach(element => {
        this.setWidth(element, config);
      });
    }
    let boxWidth = config.css.borderWidth ? config.css.width + config.css.borderWidth * 2 : config.css.width;
    boxWidth = config.css.padding ? boxWidth + config.css.padding[1] + config.css.padding[3] : boxWidth;
    const layerWidth = boxWidth + (config.css.marginLeft || 0) + (config.css.marginRight || 0);
    this.addBoxWidth(config, boxWidth);
    this.addLayerWidth(config, layerWidth);
    return config;
  }
  /** 5setHeight 计算所有节点的高 同宽度 不继承父子节点的高度*/
  setHeight(config) {
    const children = config.children;
    if (!config.css.height) {
      if (config.type == 'text') {
        config.css.height = this.getText(config).height;
      }
      // div含有字节点继承父节点的宽度 行内元素取行内元素里面的最大高度
      else if (children) {
        let inlineBlockMax = 0;
        let height = children.reduce((sum, item) => {
          if (item.css.display !== 'inline-block') {
            const res = this.setHeight(item);
            return sum + res.css.height;
          } else {
            inlineBlockMax = Math.max(inlineBlockMax, this.setHeight(item).css.height);
            return sum;
          }
        }, 0);
        console.log(height, inlineBlockMax, 1);
        config.css.height = height + inlineBlockMax;
      }
    } else if (children) {
      children.forEach(element => {
        this.setHeight(element);
      });
    }
    let boxHeight = config.css.borderWidth ? config.css.height + config.css.borderWidth * 2 : config.css.height;
    boxHeight = config.css.padding ? boxHeight + config.css.padding[0] + config.css.padding[2] : boxHeight;
    const layerHeight = boxHeight + (config.css.marginTop || 0) + (config.css.marginBottom || 0);
    this.addBoxHeight(config, boxHeight);
    this.addLayerHeight(config, layerHeight);
    return config;
  }
  /**6 setOrigin 计算所有节点的位置x,y*/
  setOrigin(config) {
    const children = config.children;
    if (children) {
      let prev = {}; //上一个相邻节点的位置
      for (let i = 0; i < children.length; i++) {
        const item = children[i];
        item.x = (item.css.marginLeft || 0) + item.css.padding[3];
        item.y = (item.css.marginTop || 0) + item.css.padding[0];
        // 父节点下的第一个元素相对于父节点0，0
        if (i == 0) {
          item.x += config.x;
          item.y += config.y;
          prev = item;
        } else {
          console.log(prev);
          if (item.css.display !== 'inline-block' || prev.css.display !== 'inline-block') {
            item.x += config.x;
            item.y += prev.y + prev.css.height + (prev.css.marginBottom || 0) + prev.css.padding[2];
            prev = item;
          } else {
            item.x += prev.x + prev.css.width + (prev.css.marginRight || 0) + prev.css.padding[1];
            item.y += config.y;
            prev = item;
          }
        }
        this.setOrigin(item);
      }
      return config;
    }
  }
  /** 获取所有图片需要等图片加载才回去绘制canvas */
  getImages(config) {
    const res = [];
    if (config.type == 'image') {
      res.push(config);
    } else if (config.children) {
      config.children.forEach(item => {
        res.push(...this.getImages(item));
      });
    }
    return res;
  }
  // 加载所有图片
  async loadAllImages(images) {
    var that = this;
    let count = 0;
    for (var i = 0; i < images.length; i++) {
      const item = images[i];
      const img = await this.loadImage(item.url);
      console.log('time2', new Date().getSeconds());
      count++;
      that.progress = count / images.length;
      item.img = img;
    }
    return images;
  }
  loadImage(url) {
    return new Promise(resolve => {
      const img = new Image();
      img.onload = () => {
        // console.log('time', new Date().getSeconds());
        setTimeout(() => {
          // console.log('time1', new Date().getSeconds());
          resolve(img);
        }, 0);
      };
      img.setAttribute('crossOrigin', 'Anonymous');
      img.src = url;
    });
  }
  // 画边界,边框 同时填充背景等 （可以改名字）
  custom(ctx, config) {
    ctx.beginPath();
    const offsetX1 = (config.css.marginLeft || 0) + config.css.padding[3];
    const offsetX2 = (config.css.marginRight || 0) + config.css.padding[1];
    const offsetY1 = (config.css.marginTop || 0) + config.css.padding[0];
    const offsetY2 = (config.css.marginBottom || 0) + config.css.padding[2];
    ctx.moveTo(config.x - offsetX1, config.y - offsetY1);
    ctx.lineTo(config.x - offsetX1, config.y + config.css.height + offsetY2);
    ctx.lineTo(config.x + config.css.width + offsetX2, config.y + config.css.height + offsetY2);
    ctx.lineTo(config.x + config.css.width + offsetX2, config.y - offsetY1);
    ctx.lineTo(config.x - offsetX1, config.y - offsetY1);
    // 只有div有填充
    if (config.type == 'div' && config.fillColor) {
      var gr =
        config.direction == 'vertical'
          ? ctx.createLinearGradient(0, 0, 0, config.css.layerHeight)
          : ctx.createLinearGradient(0, 0, config.css.layerWidth, 0);
      config.fillColor.forEach(item => {
        gr.addColorStop(item.scale, item.val);
      });
      ctx.fillStyle = gr;
      ctx.fill();
    }
    if (this.boxShow) {
      ctx.stroke();
    }
    ctx.closePath();
    // 有border属性的填充边框
    if (config.css.borderWidth) {
      this.drawRoundedRectangle(config);
    }
  }
  // 文本相关的
  getTextWidth(words, option) {
    this.ctx.font = option ? option.css.fontSize : '10px sans-serif';
    const width = this.ctx.measureText(words).width;
    return width;
  }
  /**
   *  * @param {*} option JOSN中的文本配置
   * @return {*}
   * isMeasure 如果为测量模式,只返回计算的文本高度 因为换行故绘制文字也在这份方法里面
   */
  getText(option, isMeasure = true) {
    // const size = parseFloat(/\d+px/i.exec(option.css.fontSize)[0]);
    // coolzjy@v2ex 提供的正则 https://regexr.com/4f12l 优化可断行的位置
    const pattern = /\b(?![\u0020-\u002F\u003A-\u003F\u2000-\u206F\u2E00-\u2E7F\u3000-\u303F\uFF00-\uFF1F])|(?=[\u2E80-\u2FFF\u3040-\u9FFF])/g;
    let fillText = '';
    let fillTop = option.css.lineHeight; // 返回实际换行后的高度
    let fillWidth = 0; // 返回实际换行后的宽度
    let lineNum = 1;
    //利用正则获取可断行的下标
    let breakLines = [];
    option.text.replace(pattern, function() {
      breakLines.push(arguments[arguments.length - 2] - 1);
    });
    let tempBreakLine = 0; // 此时换行的下标
    // 一个字一个子加
    for (let i = 0; i < option.text.length; i++) {
      if (breakLines.indexOf(i) !== -1) {
        tempBreakLine = i - 1;
      }
      fillText += [option.text[i]];
      // 支持 \n 换行
      if (this.getTextWidth(fillText, option) > option.css.maxWidth || option.text[i].charCodeAt(0) === 10) {
        let tempText = '';
        //最大行数限制
        if (lineNum === option.lineClamp && i !== option.text.length) {
          tempText = fillText.substring(0, fillText.length - 2) + '...';
          fillText = '';
        } else {
          if (tempBreakLine === i || option.text[i].charCodeAt(0) === 10) {
            tempText = fillText;
            fillText = '';
          } else {
            tempText = fillText.substring(0, fillText.length - (i - tempBreakLine));
            fillText = fillText.substring(fillText.length - (i - tempBreakLine), fillText.length);
          }
        }

        if (option.text[i].charCodeAt(0) === 10) {
          tempText = tempText.substring(0, tempText.length - 1);
        }
        if (!isMeasure) {
          this.drawText(option, tempText, fillTop);
        }

        if (lineNum === option.lineClamp && i !== option.text.length) {
          break;
        }
        fillTop += option.css.lineHeight || 0;
        const width = this.getTextWidth(tempText, option);
        if (width > fillWidth) {
          fillWidth = width;
        }
        lineNum++;
      }
    }
    if (fillText) {
      const width = this.getTextWidth(fillText, option);
      if (width > fillWidth) {
        fillWidth = width;
      }
      if (!isMeasure) {
        this.drawText(option, fillText, fillTop);
      }
    }

    return {
      width: fillWidth,
      height: fillTop,
    };
  }

  // 最终绘制方法
  drawCanvas(config) {
    if (config.type == 'text') {
      this.drawParagraph(config);
    }
    if (config.type == 'div') {
      config.custom(this.ctx, config);
    }
    if (config.type == 'image') {
      this.drawImage(config);
    }
    if (config.children) {
      config.children.forEach(item => {
        this.drawCanvas(item);
      });
    }
  }
  /**
   * 绘制单行多行片段
   * @param {*} config 单个定义的text对象
   */
  drawParagraph(config) {
    this.getText(config, false);
    config.custom(this.ctx, config);
  }
  /**
   * 提取公共部分 绘制文字
   * @param {*} option  单个定义的text对象
   */
  drawText(option, text, top) {
    const ctx = this.ctx;
    ctx.save();
    const size = parseFloat(/\d+px/i.exec(option.css.fontSize)[0]);
    if (option.fillColor) {
      var gradient = ctx.createLinearGradient(option.x, option.y + top, option.x + option.css.width, option.y + top);
      option.fillColor.forEach(item => {
        gradient.addColorStop(item.scale, item.val);
      });
      ctx.fillStyle = gradient;
    } else {
      ctx.fillStyle = option.css.color;
    }
    ctx.textBaseline = 'middle'; // 适配安卓 ios 下的文字居中问题
    ctx.translate(0, -(size / 2)); // 适配安卓 ios 下的文字居中问题
    ctx.fillText(text, option.x, option.y + top);
    // 支持下划线
    if (option.textDeorationLine) {
      ctx.beginPath();
      ctx.strokeStyle = ctx.fillStyle;
      ctx.lineWidth = 1;
      const y = option.textDeorationLine == 'line-through' ? option.y + top : option.y + top + size / 2;
      ctx.moveTo(option.x, y);
      ctx.lineTo(option.x + option.css.width, y);
      ctx.stroke();
    }
    this.ctx.restore();
  }
  /**
   * 绘制图片(方、圆角、圆)
   * @param {*} config 单个定义的image对象
   */
  drawImage(config) {
    const ctx = this.ctx;
    if (ctx) {
      if (config.css.radius) {
        this.drawRoundedRectangle(config, 'img');
      } else {
        ctx.drawImage(config.img, config.x, config.y, config.css.width, config.css.height);
      }
    }
  }
  /**
   * 绘制圆角矩形(可以用于图片，文字，最好跟着padding一起用)
   *
   * @param {*} ctx 画布
   * @param {Number} config 配置信息
   * @param {Number} x 左上角
   * @param {Number} y 左上角
   * @param {Number} width 宽度
   * @param {Number} height 高度
   * @param {Number} radius 圆角
   */
  drawRoundedRectangle(config, type) {
    const ctx = this.ctx;
    const rect = {
      x: config.x - config.css.borderWidth - config.css.padding[3],
      y: config.y - config.css.borderWidth - config.css.padding[0],
      width: config.css.boxWidth,
      height: config.css.boxHeight,
      radius: config.css.radius || 0,
    };
    const Point = function(x, y) {
      return { x: x, y: y };
    };
    const ptA = Point(rect.x + rect.radius, rect.y);
    const ptB = Point(rect.x + rect.width, rect.y);
    const ptC = Point(rect.x + rect.width, rect.y + rect.height);
    const ptD = Point(rect.x, rect.y + rect.height);
    const ptE = Point(rect.x, rect.y);
    console.log(ptA, ptB, ptC, ptD, ptE, 'sdfasdfasf');
    ctx.save();
    ctx.beginPath();
    config.css.borderStyle == 'dashed' && ctx.setLineDash([1, 3]);
    ctx.moveTo(ptA.x, ptA.y);
    ctx.arcTo(ptB.x, ptB.y, ptC.x, ptC.y, rect.radius);
    ctx.arcTo(ptC.x, ptC.y, ptD.x, ptD.y, rect.radius);
    ctx.arcTo(ptD.x, ptD.y, ptE.x, ptE.y, rect.radius);
    ctx.arcTo(ptE.x, ptE.y, ptA.x, ptA.y, rect.radius);
    if (type == 'img') {
      ctx.clip();
      ctx.drawImage(config.img, config.x, config.y, config.css.width, config.css.height);
      config.custom(ctx, config);
    } else {
      ctx.stroke();
    }
    ctx.closePath();
    ctx.restore();
  }
  /** 我们可以在这写一个监听进度的函数 */
  listen(type, callBack) {
    if (type == 'progressChange') {
      Object.defineProperty(this, 'progress', {
        configurable: true, //属性可配置
        set: function(v) {
          this._progress = v;
          console.log('progress发生了改变', v);
          callBack(v);
        },
        get: function() {
          return this._progress;
        },
      });
    }
  }
}

export default Poster;

// new Poster('dom', 300, 200, config, true); // 参数父节点id，宽，高，json配置，是否显示盒子边框
