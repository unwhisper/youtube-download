<template>
  <div id="wrapper">
    <main>
      <MyHeader></MyHeader>
      <div class="main_input">
        <Input search enter-button="Search" v-model="inputValue" placeholder="输入youtube视频地址" @on-search="search()" />
        <div id="videoInfo" :class="videoClass">
          <div class="playbox">
            <video :src="previewVideo" :poster="videoCover" class="videosize" controls>
            </video>
          </div>
          <div class="list">
            下载视频(有声)(mp4)：
            <div class="list_right">
              <div v-for="(item,index) in videoinfo" :key="index" class="box">
                <div v-if="item.container == 'mp4' && item.codecs.indexOf('avc1') != -1 && item.codecs.indexOf('mp4a') != -1">
                  {{item.qualityLabel}} <div v-if="item.contentLength != undefined">({{(item.contentLength/1024/1024).toFixed(2)}}MB)</div>
                  <Button size="small" class="button" icon="ios-download-outline" type="primary" :disabled="item.disable" @click="saveVideo(videourl, item.itag, item.container, index)">下载</Button>
                  <Progress :percent="item.maxPerc" :class="item.pClass" :stroke-width="15" text-inside :stroke-color="['#108ee9', '#87d068']"/>
                </div>
              </div>
            </div>
          </div>

          <div class="list">
            下载视频(无声)(mp4)：
            <div class="list_right">
              <div v-for="(item,index) in videoinfo" :key="index" class="box">
                <div v-if="item.container == 'mp4' && item.codecs.indexOf('av') != -1 && item.codecs.indexOf('mp4a') == -1">
                  {{item.qualityLabel}}({{(item.contentLength/1024/1024).toFixed(2)}}MB)
                  <Button size="small" class="button" icon="ios-download-outline" type="primary" :disabled="item.disable" @click="saveVideo(videourl, item.itag, item.container, index)">下载</Button>
                  <Progress :percent="item.maxPerc" :class="item.pClass" :stroke-width="15" text-inside :stroke-color="['#108ee9', '#87d068']"/>
                </div>
              </div>
            </div> 
          </div>

          <div class="list">
            下载视频(无声)(webm)：
            <div class="list_right">
              <div v-for="(item,index) in videoinfo" :key="index" class="box">
                <div v-if="item.container == 'webm' && item.codecs.indexOf('vp9') != -1" >
                  {{item.qualityLabel}}({{(item.contentLength/1024/1024).toFixed(2)}}MB)
                  <Button size="small" class="button" icon="ios-download-outline" type="primary" :disabled="item.disable" @click="saveVideo(videourl, item.itag, item.container, index)">下载</Button>
                  <Progress :percent="item.maxPerc" :class="item.pClass" :stroke-width="15" text-inside :stroke-color="['#108ee9', '#87d068']"/>
                </div>
              </div>
            </div>
          </div>

          <div class="list">
            下载音频(m4a)：
            <div class="list_right">
              <div v-for="(item,index) in videoinfo" :key="index" class="box">
                <div v-if="item.container == 'mp4' && !item.qualityLabel">
                  {{item.audioSampleRate}}({{(item.contentLength/1024/1024).toFixed(2)}}MB)
                  <Button size="small" class="button" icon="ios-download-outline" type="primary" :disabled="item.disable" @click="saveVideo(videourl, item.itag, item.container, index)">下载</Button>
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
const ytdl = require('ytdl-core')
const Store = require('electron-store')
const store = new Store()
// const exec = require('child_process').exec
const HttpsProxyAgent = require('https-proxy-agent')
let uploadPath, proxy, agent
export default {
  data () {
    return {
      videoClass: 'videohide',
      progressClass: 'progresshide',
      buttonDisable: false,
      inputValue: '',
      videourl: '',
      videoCover: '',
      previewVideo: '',
      videoinfo: [],
      option: ''
    }
  },
  name: 'landing-page',
  components: {
    MyHeader
  },
  created () {
    // Temporary
    uploadPath = store.get('downloadPath') + '/'
    proxy = store.get('proxy')
    agent = new HttpsProxyAgent(proxy)
    this.$layer.closeAll()
    this.$Loading.destroy()
  },
  mounted () {},
  methods: {
    search () {
      this.$layer.closeAll()
      this.$Loading.destroy()
      let url = this.inputValue
      if (url.indexOf('https://www.youtube.com') === 0) {
        let layerId = this.$layer.loading({content: '开始获取！'})
        this.$Loading.start()
        ytdl.getInfo(url, {requestOptions: {agent}}, (err, data) => {
          if (err) {
            this.$Loading.error()
            this.$layer.close(layerId)
            this.$layer.msg('获取失败')
            throw err
          }
          this.videoinfo = data.formats
          this.$Loading.finish()
          this.$layer.close(layerId)
          for (let key in this.videoinfo) {
            this.videoinfo[key].maxPerc = 0
            this.videoinfo[key].pClass = this.progressClass
            this.videoinfo[key].disable = this.buttonDisable
          }
          // console.log(this.videoinfo)
          this.videourl = url
          var arr = data.player_response.videoDetails.thumbnail.thumbnails
          this.videoCover = arr[arr.length - 1].url
          for (let key in data.formats) {
            if (data.formats[key].container === 'mp4' && data.formats[key].codecs.indexOf('avc1') !== -1 && data.formats[key].codecs.indexOf('mp4a') !== -1) {
              this.previewVideo = data.formats[key].url
            }
          }
          this.videoClass = ''
          // console.log(data)
        })
      } else {
        if (url === '') {
          this.$layer.msg('链接地址不能为空')
        } else {
          this.$layer.msg('链接地址错误')
        }
        return false
      }
    },
    saveVideo (url, itag, type, index) {
      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath)
      }
      this.$delete(this.videoinfo[index], 'pClass')
      this.$set(this.videoinfo[index], 'pClass', ' ')
      this.$delete(this.videoinfo[index], 'disable')
      this.$set(this.videoinfo[index], 'disable', true)
      ytdl.getInfo(url, {requestOptions: {agent}}, (err, data) => {
        if (err) throw err
        let formats = ytdl.chooseFormat(data.formats, { quality: itag })
        // Stream & Converter
        let stream = ytdl(url, {requestOptions: {agent}, format: formats})
        let name = data.title.replace(/\\|\/|\||\<|\>|\:|\"|\*|\?/g, '_')
        stream.pipe(fs.createWriteStream(uploadPath + name + '.' + type))
        console.log('Starting Download')

        var maxPerc = 0
        stream.on('progress', (chunkLength, downloaded, total) => {
          const percentageDownloaded = Math.floor(downloaded / total * 100)
          maxPerc = Math.max(maxPerc, percentageDownloaded)
          this.$delete(this.videoinfo[index], 'maxPerc')
          this.$set(this.videoinfo[index], 'maxPerc', maxPerc)
          // console.log(itag + '下载进度：' + maxPerc + '%')
        })

        stream.on('error', (err) => {
          console.error(err)
        })

        stream.on('end', () => {
          // console.log(itag + 'Finished')
          this.$layer.msg('下载完成')
        })
      })
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
    padding: 60px 80px 0;
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

