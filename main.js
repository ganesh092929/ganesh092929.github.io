const content = document.getElementById('content');
const channelForm = document.getElementById('channel-form');
const channelInput = document.getElementById('channel-input');
const sliderInput = document.getElementById('slider-input');
const channelData = document.getElementById('channel-data');
const videoContainer = document.getElementById('video-container');

var ChID, ChUsername,CopyData, inputURL, inputPercentage;
var APIkey = 'AIzaSyC75kLRK6zFG7NVQyP2m_G6bNH5ObmDjyo';

channelForm.addEventListener('submit', e => {
  ChID = null;
  e.preventDefault();
  inputURL = channelInput.value;
  inputPercentage = sliderInput.value;
  channelData.innerHTML = null;

  if (inputURL.indexOf("channel")>0) {
    ChID = inputURL.substring(inputURL.indexOf("channel")+8,inputURL.length);
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
  } else if (inputURL.indexOf("user")>0) {
    ChUsername = inputURL.substring(inputURL.indexOf("user")+5,inputURL.length);
    getChannelData();
    channelData.style.display = "block";
    videoContainer.style.display = "inline";

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
      ChID = CopyData.items[0].id;
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

      API_videoID();
    }
}

var totalVideoCnt, URL_VideoSearch,options_VideoSearch,nxtPgToken;
function API_videoID(nxtPgToken){
    URL_VideoSearch = 'https://www.googleapis.com/youtube/v3/search';
    options_VideoSearch = {
            part: 'snippet',
            channelId: ChID,
            maxResults: 50,
            key: APIkey,
            pageToken: nxtPgToken
    }
    $.getJSON(URL_VideoSearch,options_VideoSearch,getVideoData)

  function getVideoData(data){
    CopyData = data;
    totalVideoCnt = CopyData.pageInfo.totalResults;
    StoreVideoID();
    if (currCnt < totalVideoCnt) { 
      API_videoID(CopyData.nextPageToken);
    }
  }
}
var indvCnt = 0;
var currCnt = 0;
function StoreVideoID(){
  for (var j = 0; j <= CopyData.items.length-1; j++){
      //console.log (currCnt + ") " + CopyData.items[indvCnt].id.videoId);
      try{
        API_videoStats(currCnt, CopyData.items[indvCnt].id.videoId);
        //console.log(CopyData.items[indvCnt].id.videoId);
      } catch(err) {
        console.log(err.message);
      }
      currCnt += 1
      indvCnt += 1
      if (indvCnt == 50){indvCnt = 0;}
  }
}

var videoTitle, videoLikes, videoViews;
function API_videoStats(currCnt, videoID){
  var URL_VideoDetails = 'https://www.googleapis.com/youtube/v3/videos';
  var options_VideoDetails = {
      part: 'snippet,contentDetails,statistics',
      id: videoID,
      key: APIkey
  }
  $.getJSON(URL_VideoDetails,options_VideoDetails,getVideoStats)
  function getVideoStats(data){
    CopyData = data;
    thumbnailURL = CopyData.items[0].snippet.thumbnails.high.url
    videoTitle = CopyData.items[0].snippet.title;
    videoLikes = CopyData.items[0].statistics.likeCount;
    videoViews = CopyData.items[0].statistics.viewCount;
    PercentLikes = (videoLikes/videoViews*100).toFixed(1);

    output = `<div class="col s4 videoResult"><section class="vidThumbnail"><a href="https:\\/\\/www.youtube.com/watch?v=${videoID}"><img class = "videoImg" src = "${thumbnailURL}"</img></a></section>
              <span class = "vidDetails"><p class="PercentStats">${PercentLikes}%</p><p class="vidDesc"> ${videoTitle.substr(0,60)}</p></span></div>`;
    if (parseFloat(PercentLikes) > parseFloat(inputPercentage)) { channelData.innerHTML += output; }
  }
}

function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}
