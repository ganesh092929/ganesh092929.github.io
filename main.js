const content = document.getElementById('content');
const channelForm = document.getElementById('channel-form');
const channelInput = document.getElementById('channel-input');
const radioBtn_ChID = document.getElementById('radioBtn-ChID');
const radioBtn_ChUsername = document.getElementById('radioBtn-ChUsername');
const channelData = document.getElementById('channel-data');
const videoContainer = document.getElementById('video-container');

var ChID,ChUsername;
var APIkey = 'AIzaSyBt7BBMDq9yrrhwBDN3exkk0t9hY0waK9A';
var CopyData;
channelForm.addEventListener('submit', e => {
  e.preventDefault();
  if (radioBtn_ChID.checked) {
    ChID = channelInput.value;
    getChannelData();
    channelData.style.display = "block";
    videoContainer.style.display = "block";

    var URL_ChSearch = 'https://www.googleapis.com/youtube/v3/channels';
    var options_ChSearch = {
        id: ChID,
        key: APIkey,
        part: 'snippet,statistics,brandingSettings'
    }
    $.getJSON(URL_ChSearch,options_ChSearch,getChannelData);
  } else {
    ChUsername = channelInput.value;
    getChannelData();
    channelData.style.display = "block";
    videoContainer.style.display = "block";

    var URL_ChSearch = 'https://www.googleapis.com/youtube/v3/channels';
    var options_ChSearch = {
        forUsername: ChUsername,
        key: APIkey,
        part: 'snippet,statistics,brandingSettings'
    }
    $.getJSON(URL_ChSearch,options_ChSearch,getChannelData);
  }
  function getChannelData(data){
    CopyData = data;
    ShowChannelData();
  }
});

var videoCnt,videoData;
function ShowChannelData(){
    if (CopyData) {
      videoCnt = CopyData.items[0].statistics.videoCount;
      const output = `
        <img src=${CopyData.items[0].brandingSettings.image.bannerImageUrl} width=100%>
        <ul class="collection">
          <li class="collection-item"><b>Title: ${CopyData.items[0].snippet.title}</b></li>
          <li class="collection-item">Video Count: ${numberWithCommas(CopyData.items[0].statistics.videoCount)}</li>
          <li class="collection-item">Subscriber Count: ${numberWithCommas(CopyData.items[0].statistics.subscriberCount)}</li>
          <li class="collection-item">View Count: ${numberWithCommas(CopyData.items[0].statistics.viewCount)}</li>
          <li class="collection-item">Description: ${CopyData.items[0].snippet.description}</li>
        </ul>
        <hr>
      `;
      const channelData = document.getElementById('channel-data');
      channelData.innerHTML = output;

/*      videoData = new Array(videoCnt-1);
      for (var i = 0; i < videoCnt; i++) {
        videoData[i] = new Array(2);
      }
      API_videoID();*/
    }
}
var URL_VideoSearch,options_VideoSearch,nxtPgToken;
function API_videoID(callback){
  for (var k = 1; k <= Math.ceil(videoCnt/50); k++){
    URL_VideoSearch = 'https://www.googleapis.com/youtube/v3/search';
    options_VideoSearch = {
            part: 'snippet',
            channelId: ChID,
            maxResults: 50,
            key: APIkey,
            nextPageToken: nxtPgToken
    }
    console.log(options_VideoSearch);
    $.getJSON(URL_VideoSearch,options_VideoSearch,getVideoData)
  }
  //API_videoStats();

  function getVideoData(data,nextPageToken){
      CopyData = data;
      if (CopyData) {
         StoreVideoID();
         CopyData.nextPageToken = nextPageToken;
      }
  }
}
var currCnt = 0;
function StoreVideoID(){
  for (var j = 0; j < CopyData.itEms.length; j++){
      videoData[currCnt][0] = CopyData.items[j].id.videoId;
      currCnt += 1
      if (currCnt=> videoCnt){break;}
  }
  nxtPgToken = CopyData.nextPageToken;
}

function API_videoStats(){
  for (var k = 0; k < videoCnt; k++){
    console.log(videoData[k][0]);
    if (videoData[k][0]){
      var URL_VideoDetails = 'https://www.googleapis.com/youtube/v3/videos';
      var options_VideoDetails = {
          part: 'snippet,contentDetails,statistics',
          id: videoData[k][0],
          key: APIkey
      }
      $.getJSON(URL_VideoDetails,options_VideoDetails,getVideoStats)
      function getVideoStats(data){
        CopyData = data;
        //StoreVideoStats();
      }
    }
  }
}
function StoreVideoStats(){
  for (var j = 0; j < videoData.length; j++){
    videoData[j][1] = CopyData.items[0].id.videoId;
  }
}

function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}
