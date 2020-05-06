<template>
  <div>
    <!-- nav 非首页显示header-->
    <div class="nav" v-if="thisPath  != 'index'" @dblclick="max" style="-webkit-app-region: drag;">
      <div class="logo_img">
        <img src="../assets/logo.png" style="-webkit-app-region: no-drag;" @click="toIndexPage" />
      </div>
      <div class="go-back">
        <Icon type="ios-arrow-back" size="18" class="prev_bar" style="-webkit-app-region: no-drag;" @click="prev" />
        <Icon type="ios-arrow-forward" size="18" class="next_bar" style="-webkit-app-region: no-drag;" @click="next" />
      </div>
      <Icon type="ios-easel-outline" size="18" class="bar" title="bilibili" style="-webkit-app-region: no-drag;"  @click="toBilibili"/>
      <Icon type="ios-albums-outline" size="18" class="bar" title="合并音视频" style="-webkit-app-region: no-drag;"  @click="toMerge"/>
      <Icon type="md-settings" size="18" class="bar" title="设置" style="-webkit-app-region: no-drag;"  @click="toSetting"/>
      <i class="fenge" style="-webkit-app-region: no-drag;"></i>
      <Icon type="md-remove" size="18" class="bar" title="最小化" style="-webkit-app-region: no-drag;"  @click="min"/>
      <Icon type="ios-browsers-outline" size="18" class="bar" style="font-weight:bold;-webkit-app-region: no-drag;" title="缩小" @click="max" v-if="is_max" />
      <Icon type="md-square-outline" size="18" class="bar" title="最大化" style="-webkit-app-region: no-drag;" @click="max" v-else />
      <Icon type="md-close" size="18" class="bar right-bar" title="关闭" style="-webkit-app-region: no-drag;" @click="close"/>
    </div>
  </div>
</template>
<script type="text/javascript">
const { ipcRenderer } = require('electron')
export default {
  props: {
    // 当前页面名称
    thisPath: {
      type: String
    },
    isIndex: {
      type: Boolean
    }
  },
  // 格式化日期
  filters: {
    formatDate (dateStr) {
      let timer = parseInt(dateStr) * 1000
      let timeNumber = new Date(timer)
      let year = timeNumber.getFullYear()
      let month = timeNumber.getMonth() + 1
      let date = timeNumber.getDate()
      return (
        year +
        '-' +
        (month < 10 ? '0' + month : month) +
        '-' +
        (date < 10 ? '0' + date : date)
      )
    }
  },
  data () {
    return {
      // 登录需要的key
      event_key: '',
      // 定时器
      loginTimer: '',
      // 价格列表
      localProductList: {},
      // 窗口是否最大化
      is_max: ''
    }
  },
  components: {},
  computed: {},
  created () {
    ipcRenderer.on('isMax', (event, arg) => {
      // console.log(arg)
      this.is_max = arg
    })
  },
  mounted () {},
  methods: {
    // 最小化窗口
    min () {
      ipcRenderer.send('min')
    },
    // 最大化窗口
    max () {
      ipcRenderer.send('max')
    },
    // 关闭窗口
    close () {
      ipcRenderer.send('close')
    },
    // 返回上一层
    prev () {
      this.$router.go(-1)
    },
    // 返回下一层
    next () {
      this.$router.go(1)
    },
    // 点击跳转主页
    toSetting () {
      this.$router.push({
        name: 'setting'
      })
    },
    toMerge () {
      this.$router.push({
        name: 'merge'
      })
    },
    toBilibili () {
      this.$router.push({
        name: 'bilibili'
      })
    },
    toIndexPage (res) {
      this.$router.push({
        name: 'LandingPage'
      })
    },
    // 点击跳转主页
    toIndex () {
      this.$router.push({
        name: 'LandingPage'
      })
    }
  }
}
</script>
<style scoped lang="less">
.logo_img {
  width: 180px;
  height: 50px;
  cursor: pointer;
  background: #222225;
  display: flex;
  align-items: center;
  position: fixed;
  top: 0;
  left: 20px;
  z-index: 1000;
  img {
    width: 115px;;
  }
}
.go-back{
  width: 180px;
  height: 50px;
  display: flex;
  align-items: center;
  position: fixed;
  top: 0;
  left: 250px;
  z-index: 1000;
}
.prev_bar{
  color: rgb(255,255,255);
  border: 1px solid;
  border-color: rgba(255,255,255,.5);
}
.next_bar{
  color: rgb(255,255,255);
  border: 1px solid;
  border-color: rgba(255,255,255,.5);
  border-left: none;
}
.fenge{
  width: 2px;
  height: 18px;
  margin: 0 12px;
  background: rgba(255,255,255,.5);
}
.bar{
  cursor: pointer;
  margin: 0 3px;
  color: rgba(255,255,255,.5);
  &:hover {
    color: rgb(255,255,255);
  }
}
.right-bar{
  width: 10px;
  margin-right:20px;
}
.recharge_fixed {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 9999;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  .recharge_inner {
    width: 840px;
  }
}
.index_top {
  width: 1280px;
  margin: 0 auto;
  height: 120px;
  .user_info {
    height: 100%;
    position: relative;
    display: flex;
    align-items: center;
    margin: 0 50px;
    padding: 20px 0;
    cursor: pointer;
    span {
      margin-left: 15px;
      color: #fff;
      font-size: 18px;
    }
    .down_icon {
      color: #fff;
      margin-left: 5px;
      font-size: 24px;
      transition: all 0.5s;
    }
    &:hover .down_icon {
      transform: rotate(180deg);
    }
    &:hover .user_des {
      display: block;
    }
    .user_img {
      width: 20px;
      height: 20px;
      border-radius: 50%;
    }
    .user_des {
      display: none;
      position: absolute;
      top: 80px;
      left: -50px;
      width: 260px;
      background: #fff;
      z-index: 999;
      box-shadow: 0 0 30px rgba(144, 145, 155, 0.3);
      .user_des_inner {
        position: relative;
        .spe_icon {
          position: absolute;
          top: -5px;
          left: 124px;
          width: 0;
          height: 0;
          border-style: solid;
          border-width: 6px;
          border-color: transparent transparent #fff #fff;
          transform: rotate(135deg);
          box-shadow: -2px 2px 3px 0 rgba(144, 145, 155, 0.2);
        }
        .info_title {
          padding: 20px;
          border-bottom: 1px solid #cccccc;
          .name {
            color: #333333;
            font-size: 18px;
            margin-bottom: 5px;
            font-weight: bold;
          }
          .id {
            color: #999999;
            font-size: 14px;
          }
        }
        .info_item {
          padding: 14px 20px;
          display: flex;
          align-items: center;
          img {
            width: 24px;
            margin-right: 10px;
          }
          .text {
            color: #333;
            max-width: 120px;
            font-size: 16px;
          }
        }
        .vip_count {
          padding: 14px 20px;
          display: flex;
          align-items: center;
          img {
            width: 24px;
            height: 24px;
            margin-right: 10px;
          }
          .text {
            color: #333;
            font-size: 16px;
            max-width: 120px;
            .timer {
              color: #999;
              margin-top: 5px;
              font-size: 14px;
              width: 100%;
            }
            .count {
              width: 100%;
            }
          }
          .recharge_bnt {
            height: 35px;
            line-height: 35px;
            padding: 0 20px;
            margin-left: 15px;
            background: #ff9933;
            color: #fff;
            font-size: 14px;
            border-radius: 4px;
          }
        }
      }
    }
  }
  .logo {
    width: 230px;
    cursor: pointer;
  }
  .header_click {
    .click_item {
      font-size: 18px;
      height: 36px;
      line-height: 36px;
      padding: 0 20px;
      color: #fff;
      cursor: pointer;
      margin: 20px 0;
      margin-left: 25px;
    }
    .buy_btn {
      background: #fff;
      color: #222225;
    }
  }
}
.nav {
  position: fixed;
  right: 0;
  top: 0;
  height: 50px;
  width: 100%;
  background: #222225;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  z-index: 999;
  .click_item {
    color: rgba(255,255,255,0.6);
    font-size: 18px;
    height: 36px;
    line-height: 36px;
    padding: 0 10px;
    cursor: pointer;
    transition: all 0.5s;
    &:hover {
      color: rgb(255,255,255);
    }
  }
  .buy_vip {
    color: #fff;
    font-size: 18px;
    height: 36px;
    line-height: 36px;
    padding: 0 20px;
    margin-right: 40px;
    cursor: pointer;
    background: #ff9933;
    border-radius: 2px;
  }
  .user_info {
    height: 100%;
    position: relative;
    display: flex;
    align-items: center;
    padding: 0 10px;
    cursor: pointer;
    span {
      font-size: 18px;
      padding-left: 5px;
      color: rgba(255,255,255,.5);
      &:hover{
        color: rgb(255,255,255);
      }
    }
    .down_icon {
      font-size: 22px;
      margin-left: 5px;
      color: rgba(255,255,255,.5);
      transition: all 0.5s;
    }
    &:hover .down_icon {
      transform: rotate(180deg);
      color: rgb(255,255,255);
    }
    &:hover .user_des {
      display: block;
    }
    .user_img {
      width: 25px;
      height: 25px;
      border-radius: 50%;
    }
    .user_des {
      display: none;
      position: absolute;
      top: 50px;
      left: -50px;
      width: 260px;
      background: #fff;
      z-index: 999;
      box-shadow: 0 10px 30px rgba(144, 145, 155, 0.3);
      .user_des_inner {
        position: relative;
        .spe_icon {
          position: absolute;
          top: -5px;
          left: 124px;
          width: 0;
          height: 0;
          border-style: solid;
          border-width: 6px;
          border-color: transparent transparent #fff #fff;
          transform: rotate(135deg);
          box-shadow: -2px 2px 3px 0 rgba(144, 145, 155, 0.2);
        }
        .info_title {
          padding: 20px;
          border-bottom: 1px solid #cccccc;
          .name {
            color: #333333;
            font-size: 18px;
            margin-bottom: 5px;
            font-weight: bold;
          }
          .id {
            color: #999999;
            font-size: 14px;
          }
        }
        .info_item {
          padding: 14px 20px;
          display: flex;
          align-items: center;
          img {
            width: 24px;
            margin-right: 10px;
          }
          .text {
            color: #333;
            font-size: 18px;
          }
        }
        .vip_count {
          padding: 14px 20px;
          display: flex;
          align-items: center;
          img {
            width: 24px;
            height: 24px;
            margin-right: 10px;
          }
          .text {
            color: #333;
            font-size: 16px;
            .timer {
              color: #999;
              margin-top: 5px;
              font-size: 14px;
            }
          }
        }
        .recharge_bnt {
          padding: 0 20px;
          height: 35px;
          line-height: 35px;
          margin-left: 15px;
          background: #ff9933;
          color: #fff;
          font-size: 14px;
          border-radius: 4px;
        }
      }
    }
  }
}
</style>