<template>
  <div :class="['wrap', { black: showCanvas }]">
    <template v-if="!showCanvas">
      <van-cell title="显示分享面板" @click="show" />
      <van-share-sheet v-model="showShare" title="分享" :options="options" @select="onSelect" />
    </template>
    <div v-if="showCanvas && loading">
      <van-loading class="loading" type="spinner" color="#1989fa" vertical>生成{{ progress }}%...</van-loading>
    </div>
    <div id="demo"></div>
    <div v-show="showCanvas && !loading" class="foo">
      <ul>
        <li v-for="(item, index) of icons" :key="index" class="icon" @click="generate(index)">
          <img :src="item.src" />
          <span>{{ item.name }}</span>
        </li>
      </ul>
    </div>
  </div>
</template>
<script>
// import { Toast } from 'vant';
import Poster from './poster.js';
// 只有三种type div text image div不能写字
export default {
  name: 'Canvas',
  props: {
    width: {
      type: Number,
      default: 300,
    },
    height: {
      type: Number,
      default: 300,
    },
  },
  data() {
    return {
      showShare: false,
      showCanvas: false,
      loading: false,
      progress: 0,
      icons: [
        { src: require('../assets/icons/1.png'), name: '微信' },
        { src: require('../assets/icons/2.png'), name: '朋友圈' },
        { src: require('../assets/icons/3.png'), name: '微博' },
        { src: require('../assets/icons/4.png'), name: 'QQ' },
        { src: require('../assets/icons/5.png'), name: '下载' },
      ],
      options: [
        { name: '微信', icon: 'wechat' },
        { name: '微博', icon: 'weibo' },
        { name: '复制链接', icon: 'link' },
        { name: '分享海报', icon: 'poster' },
        { name: '二维码', icon: 'qrcode' },
      ],
      config: {
        type: 'div',
        x: 0,
        y: 0,
        fillColor: [
          { scale: 0, val: '#fff' },
          { scale: 0.5, val: '#fff' },
          { scale: 1, val: '#fff' },
        ],
        css: {
          width: 300,
          height: 480,
        },
        children: [
          {
            type: 'image',
            css: {
              width: 200,
              height: 200,
              marginLeft: 0,
              marginRight: 4,
              marginTop: 0,
              display: 'inline-block',
            },
            url: 'https://img.bee-cdn.com/large/3b9ae203lz1go6jkyd16dj20u00u0jvc.jpg',
          },
          {
            type: 'div',
            css: {
              display: 'inline-block',
            },
            children: [
              {
                type: 'image',
                css: {
                  width: 96,
                  height: 98,
                  marginLeft: 0,
                  marginRight: 0,
                  marginTop: 0,
                  display: 'block',
                },
                url: 'https://img.bee-cdn.com/large/3b9ae203lz1go6jjxn6p3j20u00u0n10.jpg',
              },
              {
                type: 'image',
                css: {
                  width: 96,
                  height: 98,
                  marginLeft: 0,
                  marginRight: 0,
                  marginTop: 4,
                  display: 'block',
                },
                url: 'https://img.bee-cdn.com/large/3b9ae203lz1go6jk5php3j20u0140qaf.jpg',
              },
            ],
          },
          {
            type: 'div',
            css: {
              display: 'block',
              marginTop: 4,
            },
            children: [
              {
                type: 'image',
                css: {
                  width: 30,
                  height: 30,
                  marginLeft: 30,
                  marginRight: 0,
                  marginTop: 0,
                  borderWidth: 0,
                  radius: 15,
                  display: 'inline-block',
                },
                url: 'https://img.bee-cdn.com/orj360/3b9ae24blz1gk6aaxhv4lj20ja0ja75v.jpg',
              },
              {
                type: 'text',
                css: {
                  display: 'inline-block',
                  fontSize: '16px',
                  marginRight: 30,
                  marginLeft: 6,
                  padding: [7, 0, 7, 0],
                  color: '#000',
                },
                text: 'lemon_kuku',
                //textDeorationLine: 'line-through', //是否下划线
              },
            ],
          },
          {
            type: 'text',
            css: {
              fontSize: '16px',
              borderWidth: 1,
              borderColor: '#fff',
              borderStyle: 'dashed',
              radius: 10,
              marginLeft: 30,
              marginTop: 10,
              marginBottom: 4,
              marginRight: 50,
              padding: [10, 10, 10, 10],
              maxWidth: 200,
            },
            text: '这是一个很长的段落\n可以换行\n可以渐变，可以下划线\n祝大家新年快乐🔥',
            textDeorationLine: 'underLine',
            lineClamp: 5,
            fillColor: [
              { scale: 0, val: 'orange' },
              { scale: 0.5, val: 'pink' },
              { scale: 1, val: 'red' },
            ],
          },
          {
            type: 'text',
            css: {
              display: 'inline-block',
              fontSize: '16px',
              marginRight: 30,
              marginLeft: 30,
              color: '#03a9f4',
            },
            text: '标签：DioR 美女 房屋',
            // textDeorationLine: 'line-through',
          },
          {
            type: 'image',
            css: {
              width: 300,
              height: 100,
              marginLeft: 0,
              marginRight: 0,
              marginTop: 0,
              display: 'block',
            },
            url: 'https://du.hupucdn.com/Fj0gDUhaZtZ5jCHC0xEPtcWdkkeM',
          },
          {
            type: 'image',
            css: {
              width: 80,
              height: 80,
              marginLeft: 120,
              marginRight: 0,
              marginTop: -80,
              display: 'block',
            },
            url: 'https://img.bee-cdn.com/large/3b9ae203lz1go6kn8i6nhj2074074jr9.jpg',
          },
          {
            type: 'text',
            css: {
              display: 'block',
              fontSize: '16px',
              marginRight: 30,
              marginLeft: 130,
              color: '#999',
            },
            text: '长按查此动态',
          },
        ],
      },
    };
  },
  methods: {
    show() {
      this.showShare = true;
    },
    onSelect() {
      this.showCanvas = true;
      this.showShare = false;
      const poster = new Poster('demo', 300, 500, this.config, false);
      this.loading = true;
      poster.init();
      poster.listen('progressChange', () => {
        console.log(poster.progress);
        this.progress = (poster.progress * 100).toFixed(2);
        if (poster.progress == 1) {
          this.loading = false;
        }
      });
    },

    generate(index) {
      if (index == 4) {
        var a = document.createElement('a');
        var canvas = document.getElementById('canvas');
        a.href = canvas.toDataURL();
        a.download = 'canvas.png';
        a.click();
      }
      document.getElementById('demo').innerHTML = '';
      this.showCanvas = false;
      this.progress = 0;
    },
  },
};
</script>
<style lang="less" scoped>
.black {
  background: #000;
  padding-top: 40px;
  height: 100vh;
}
#demo {
  margin: 0 auto;
}
p {
  font-size: 16px;
}
.loading {
  position: absolute;
  top: 20%;
  left: 50%;
  margin-left: -30px;
}
.foo {
  position: absolute;
  width: 100%;
  bottom: 80px;

  ul {
    display: flex;
    justify-content: space-around;
  }
  .icon {
    background: #fff;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    font-size: 12px;
    text-align: center;
    color: #fff;
    img {
      width: 100%;
      height: 100%;
    }
  }
}
</style>
