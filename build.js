var electronInstaller = require('electron-winstaller');
var path = require("path");
 resultPromise = electronInstaller.createWindowsInstaller({
  appDirectory: path.join('./build/win-ia32-unpacked'), //入口
  outputDirectory: path.join('./tmp'),     //出口       //名称
  setupIcon: path.join('./build/icons/icon.ico'),//安装图标，必须本地
  iconUrl: 'file:///D:/electron/youtube/build/icons/icon.ico',//程序图标，必须url
  loadingGif: path.join('./build/icons/loading.gif'),
  noMsi: true,
});
resultPromise.then(() => console.log("It worked!"), (e) => console.log(`No dice: ${e.message}`));