<template>
  <div id="wrapper">
    <main>
      <MyHeader></MyHeader>
      <div class="main_input">
        <Input search enter-button="Search" v-model="inputValue" placeholder="输入bilibili视频地址" @on-search="search()" />
        <div id="videoInfo" :class="videoClass">
          <!-- <div class="playbox">
            <iframe src="//player.bilibili.com/player.html?aid=412796104&bvid=BV1ZV411o78f&cid=181577535&page=1" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true"> </iframe>
          </div> -->
          <div class="list">
            下载视频(无声)(mp4)：
            <div class="list_right">
              <div v-for="(item,index) in videoinfo" :key="index" class="box">
                <div>
                  <div v-if="item.width > item.height">{{item.height}}P {{item.size}}</div>
                  <div v-else>{{item.width}}P {{item.size}}</div>
                  <Button size="small" class="button" icon="ios-download-outline" type="primary" :disabled="item.disable" @click="download(item.baseUrl, videourl, 'video', index)">下载</Button>
                  <Progress :percent="item.maxPerc" :class="item.pClass" :stroke-width="15" text-inside :stroke-color="['#108ee9', '#87d068']"/>
                </div>
              </div>
            </div> 
          </div>

          <div class="list">
            下载音频：
            <div class="list_right">
              <div v-for="(item,index) in audioinfo" :key="index" class="box">
                <div>
                  {{item.id}} {{item.size}}
                  <Button size="small" class="button" icon="ios-download-outline" type="primary" :disabled="item.disable" @click="download(item.baseUrl, videourl, 'audio', index)">下载</Button>
                  <Progress :percent="item.maxPerc" :class="item.pClass" :stroke-width="15" text-inside :stroke-color="['#108ee9', '#87d068']"/>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </main>
  </div>
</template>

<script>
// Library
import MyHeader from '@/components/Header'
const fs = require('fs')
const Store = require('electron-store')
const store = new Store()
const request = require('request')
const progress = require('request-progress')
const zlib = require('zlib')
const iconv = require('iconv-lite')
let uploadPath
export default {
  data () {
    return {
      videoClass: 'videohide',
      progressClass: 'progresshide',
      buttonDisable: false,
      inputValue: '',
      videourl: '',
      videoinfo: [],
      audioinfo: [],
      videotitle: ''
    }
  },
  name: 'bilibili',
  components: {
    MyHeader
  },
  created () {
    // Temporary
    uploadPath = store.get('downloadPath') + '/'
    this.$layer.closeAll()
    this.$Loading.destroy()
  },
  mounted () {},
  methods: {
    download (url, referer, type, index) {
      let filename = ''
      let fullPath = ''
      let option = {
        uri: url,
        headers: {
          'Accept-Charset': 'ISO-8859-1,utf-8;q=0.7,*;q=0.7',
          'Accept-Encoding': 'gzip, deflate',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.89 Safari/537.36',
          'Referer': referer,
          'Accept-Language': 'en-us,en;q=0.5'
        }
      }
      if (type === 'video') {
        filename = this.videotitle + '.mp4'
        fullPath = uploadPath + filename
        this.$delete(this.videoinfo[index], 'pClass')
        this.$set(this.videoinfo[index], 'pClass', ' ')
        this.$delete(this.videoinfo[index], 'disable')
        this.$set(this.videoinfo[index], 'disable', true)
      } else if (type === 'audio') {
        filename = this.videotitle + '.m4a'
        fullPath = uploadPath + filename
        this.$delete(this.audioinfo[index], 'pClass')
        this.$set(this.audioinfo[index], 'pClass', ' ')
        this.$delete(this.audioinfo[index], 'disable')
        this.$set(this.audioinfo[index], 'disable', true)
      }
      let that = this
      // The options argument is optional so you can omit it
      progress(request(option), {
        // throttle: 2000,                    // Throttle the progress event to 2000ms, defaults to 1000ms
        // delay: 1000,                       // Only start to emit after 1000ms delay, defaults to 0ms
        // lengthHeader: 'x-transfer-length'  // Length header to use, defaults to content-length
      })
        .on('progress', function (state) {
        // The state is an object that looks like this:
        // {
        //     percent: 0.5,               // Overall percent (between 0 to 1)
        //     speed: 554732,              // The download speed in bytes/sec
        //     size: {
        //         total: 90044871,        // The total payload size in bytes
        //         transferred: 27610959   // The transferred payload size in bytes
        //     },
        //     time: {
        //         elapsed: 36.235,        // The total elapsed seconds since the start (3 decimals)
        //         remaining: 81.403       // The remaining seconds to finish (3 decimals)
        //     }
        // }
          let perc = (state.percent * 100).toFixed(1)
          let percent = perc + '%'
          let dprogress = Number(perc)

          let speed = 0
          if (Math.floor((state.speed / 1024)) >= 1024) {
            speed = (state.speed / 1024 / 1024).toFixed(2) + 'MB/s'
          } else {
            speed = Math.floor((state.speed / 1024)) + 'KB/s'
          }

          let total = 0
          if ((state.size.total / 1024) >= 1024) {
            let mb = state.size.total / 1024 / 1024
            total = mb >= 1024 ? (state.size.total / 1024 / 1024 / 1024).toFixed(2) + 'GB' : (state.size.total / 1024 / 1024).toFixed(1) + 'MB'
          } else {
            total = Math.ceil((state.size.total / 1024)) + 'KB'
          }

          let remaining = state.time.remaining >= 60 ? (state.time.remaining / 60) >= 60 ? (state.time.remaining / 60 / 60).toFixed(1) + '时' : Math.ceil(state.time.remaining / 60) + '分' : Math.ceil(state.time.remaining) + '秒'
          console.log('progress', percent, speed, total, remaining)
          if (type === 'video') {
            that.$delete(that.videoinfo[index], 'maxPerc')
            that.$set(that.videoinfo[index], 'maxPerc', dprogress)
            that.$delete(that.videoinfo[index], 'size')
            that.$set(that.videoinfo[index], 'size', '(' + total + ')')
          } else if (type === 'audio') {
            that.$delete(that.audioinfo[index], 'maxPerc')
            that.$set(that.audioinfo[index], 'maxPerc', dprogress)
            that.$delete(that.audioinfo[index], 'size')
            that.$set(that.audioinfo[index], 'size', '(' + total + ')')
          }
        })
        .on('error', function (err) {
          // Do something with err
          console.log(err)
        })
        .on('end', function () {
          if (type === 'video') {
            that.$delete(that.videoinfo[index], 'maxPerc')
            that.$set(that.videoinfo[index], 'maxPerc', 100)
          } else if (type === 'audio') {
            that.$delete(that.audioinfo[index], 'maxPerc')
            that.$set(that.audioinfo[index], 'maxPerc', 100)
          }
          that.$layer.msg('下载完成')
        })
        .pipe(fs.createWriteStream(fullPath))
    },
    search () {
      this.$layer.closeAll()
      this.$Loading.destroy()
      let that = this
      let url = that.inputValue
      if (url.indexOf('https://www.bilibili.com') === 0) {
        let layerId = that.$layer.loading({content: '开始获取！'})
        that.$Loading.start()
        let options = {
          uri: url,
          encoding: null,
          // proxy: 'http://47.88.57.66:8888',
          headers: {
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
            'Accept-Encoding': 'gzip, deflate, br',
            'Accept-Language': 'zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7',
            'Referer': 'https://www.bilibili.com/',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.113 Safari/537.36'
          }
        }
        request(options, function (err, res, body) {
          if (!err && res.statusCode === 200) {
            if (res.headers['content-encoding'] === 'gzip') {
              zlib.gunzip(body, function (error, dezipped) {
                if (!error) {
                  let html = iconv.decode(dezipped, 'utf-8')
                  let matchArr = html.match(/<script[^>]*>window.__playinfo__=[\s\S]*?<\/[^>]*script>/gi)
                  if (matchArr) {
                    let matchTitle = html.match(/<span class="tit[\s\S]*?">[\s\S]*?<\/[^>]*span>/gi)
                    let title = matchTitle[0].replace(/<\/?.+?>/g, '')
                    that.videotitle = title
                    let resultHtml = matchArr[0].replace(/<\/?.+?>/g, '')
                    let palyHtml = resultHtml.replace('window.__playinfo__=', '')
                    let palyobj = JSON.parse(palyHtml)
                    that.videourl = url
                    that.showInfo(palyobj, layerId)
                  } else {
                    that.$Loading.error()
                    that.$layer.close(layerId)
                    that.$layer.msg('获取失败')
                    // throw '获取失败'
                  }
                }
              })
            } else {
              console.log(body)
            }
          }
        })
      } else {
        if (url === '') {
          that.$layer.msg('链接地址不能为空')
        } else {
          that.$layer.msg('链接地址错误')
        }
        return false
      }
    },
    showInfo (obj, layerId) {
      if (obj) {
        this.videoinfo = obj.data.dash.video
        this.audioinfo = obj.data.dash.audio
        this.$Loading.finish()
        this.$layer.close(layerId)
        for (let key in this.videoinfo) {
          this.videoinfo[key].maxPerc = 0
          this.videoinfo[key].pClass = this.progressClass
          this.videoinfo[key].disable = this.buttonDisable
          this.videoinfo[key].size = ''
        }
        for (let key in this.audioinfo) {
          this.audioinfo[key].maxPerc = 0
          this.audioinfo[key].pClass = this.progressClass
          this.audioinfo[key].disable = this.buttonDisable
          this.audioinfo[key].size = ''
        }
        this.videoClass = ''
      } else {
        this.$Loading.error()
        this.$layer.close(layerId)
        this.$layer.msg('获取失败')
      }
    }
  }
}
</script>

<style scoped>
  #wrapper {
    background:
      radial-gradient(
        ellipse at top left,
        rgba(255, 255, 255, 1) 40%,
        rgba(229, 229, 229, .9) 100%
      );
    height: 100%;
    padding: 60px 80px 0px;
    width: 100%;
    overflow: scroll;
  }
  #wrapper::-webkit-scrollbar {
    width: 0 !important;
  }

  main {
    display: flex;
    justify-content: space-between;
  }
  .main_input{
    width: 100%;
  }

  .videohide{
    display: none;
  }

  .progresshide{
    display: none!important;
  }

  .playbox{
    display: flex;
    justify-content: center;
    margin: 20px 0;
    height: 500px;
  }

  .videosize{
    width: 800px;
    height: 450px;
  }

  .button{
    margin: 0 10px;
  }

  #videoInfo .list{
    margin: 10px;
  }

  #videoInfo .list .list_right{
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    margin: 10px;
  }
  #videoInfo .list .list_right .box div{
    display: flex;
    align-items: center;
    margin: 5px 0;
  }
  .ivu-progress{
    width: 120px!important;
    height: 15px!important;
    margin-right: 10px!important;
  }
</style>

