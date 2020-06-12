<template>
<div>
    <div class="top">
      <MyHeader></MyHeader>
      <div class="index_mid flex_between"></div>
    </div>
    <div id="setting">
        <div id="headers">
        </div>

        <div id="setContent">
          <div class="inputClass">
            <label>视频：</label>
            <Input v-model="video" placeholder="选择视频" disabled style="width: 400px" />
            <Button type="success" ghost @click="chooseVideo()">选择视频</Button>
          </div>
          <div class="inputClass">
            <label>音频：</label>
            <Input v-model="audio" placeholder="选择音频" disabled style="width: 400px" />
            <Button type="success" ghost @click="chooseAudio()">选择音频</Button>
          </div>
          <div :class="progresshide ? 'inputClass progress' : 'inputClass'">
            <label class="nowrap">合并进度：</label>
            <Progress :percent="percent" :stroke-width="20" :stroke-color="['#108ee9', '#87d068']" text-inside/>
            <Button type="success" :class="openhide" @click="openFile()">打开文件</Button>
          </div>
          <div class="inputClass">
            <Button type="success" style="width:400px;" @click="mergeVideoAudio()">合并音视频</Button>
          </div>
        </div>
    </div>
</div>
</template>

<script>
import MyHeader from '@/components/Header'
const fs = require('fs')
const path = require('path')
const { dialog, shell } = require('electron').remote
const ffmpeg = require('fluent-ffmpeg')
const ffmpegPath = path.resolve(__dirname, '../../../ffmpeg.exe')
ffmpeg.setFfmpegPath(ffmpegPath)
export default {
  data () {
    return {
      video: '',
      audio: '',
      progresshide: true,
      openhide: 'progress',
      mergePath: '',
      percent: 0
    }
  },
  components: {
    MyHeader
  },
  created () {
    this.$layer.closeAll()
    this.$Loading.destroy()
  },
  methods: {
    openFile () {
      shell.openItem(this.mergePath)
    },
    /**
     * 选择文件夹
     */
    chooseVideo () {
      let that = this
      dialog.showOpenDialog({
      // 默认路径
      // defaultPath :'D:/Documents/Downloads',
      // 选择操作，此处是打开文件夹
        properties: [
          'openFile'
        ],
        // 过滤条件
        filters: [
          { name: 'All', extensions: ['mp4', 'webm', 'avi'] }
        ]
      }).then(result => {
        if (result.canceled === false) {
          that.video = result.filePaths[0]
        }
      }).catch(err => {
        console.log(err)
      })
    },
    chooseAudio () {
      let that = this
      dialog.showOpenDialog({
      // 默认路径
      // defaultPath :'D:/Documents/Downloads',
      // 选择操作，此处是打开文件夹
        properties: [
          'openFile'
        ],
        // 过滤条件
        filters: [
          { name: 'All', extensions: ['mp3', 'mp4', 'webm', 'weba', 'm4a'] }
        ]
      }).then(result => {
        if (result.canceled === false) {
          that.audio = result.filePaths[0]
        }
      }).catch(err => {
        console.log(err)
      })
    },
    mergeVideoAudio () {
      let video = this.video
      let audio = this.audio
      this.percent = 100
      this.openhide = 'progress'
      let savePath = video.substring(0, video.lastIndexOf('.')) + 'merge.mp4'
      let that = this
      that.mergePath = savePath
      let command = ffmpeg(video)
        .input(audio)
        .outputOptions(['-c:v h264', '-c:a aac'])
        .output(savePath)
        .on('start', function (commandLine) {
          that.progresshide = false
          console.log('Spawned Ffmpeg with command: ' + commandLine)
        })
        .on('codecData', function (data) {
          console.log('Input is ' + data.audio + ' audio ' + 'with ' + data.video + ' video')
        })
        .on('progress', function (progress) {
          console.log(progress.percent)
          let percent = parseFloat(progress.percent).toFixed(1)
          that.percent = percent > 100 ? 100 : Number(percent)
          console.log('Processing: ' + progress.percent + '% done')
        })
        .on('error', function (err, stdout, stderr) {
          console.log('Cannot process video: ' + err.message)
        })
        .on('end', function (stdout, stderr) {
          that.percent = 100
          that.openhide = ''
          that.$layer.msg('合并完成')
        })
        .run()
      // var proc = ffmpeg('D:/electron/youtube/src/renderer/lux/images%5d.png').inputFPS(24).save('target.avi') // 合并图片为视频
    }
  }
}
</script>

<style lang="less" scoped>
#setting{
    .ivu-modal-header {
      background-color: #cde;
    }
    .ivu-modal-body{
      background-color: #cde;
    }
    .ivu-modal-footer{
      background-color: #cde;
    }
    height: 100%;
    // 头部
    #headers{
        height: 50px;
        padding: 0 20px;
        display: flex;
        align-items: center;
        box-shadow: 1px 1px 3px rgba(0, 0, 0, .1);
        img{
            width: 20px;
            height: 20px;
        }
        span{
            font-size: 18px;
            line-height: 18px;
            padding-left: 5px;
        }
    }

    // 内容
    #setContent{
        width: 100%;
        height: calc(100% - 50px);
        display: flex;
        flex-direction: column;
    }

    .inputClass{
      width: 520px;
      margin: 20px auto;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .progress{
      display: none;
    }

    .nowrap{
      white-space:nowrap;
      text-overflow:ellipsis;
    }
}
</style>