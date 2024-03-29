function init(){
    let _title=document.getElementById('dlgtitle');

    console.log('dialog initialized');
    if(_title.innerText.search('Google Search')>-1){
        searchInGoogle();
    }
    if(_title.innerText.search('Translate')>-1){
        searchInWebiio();
    }
    if(_title.innerText.search('Image Search')>-1){
        searchImageSearch();
    }
}

function setResult(imageURL, imageTitle){
        document.getElementById('linktitle').innerHTML=imageTitle;
        document.getElementById('resultURL').value=imageURL;
        document.getElementById('resultTitle').value=imageTitle;
}

function searchImageSearch(){
    let pixabayengine='https://pixabay.com/api/';
    let query=document.getElementById('query').value.replace(' ', '+');
    let apikey=document.getElementById('APIKey').value;
    let reshtml=document.getElementById('result');
    reshtml.innerHTML+='<ul id="resultlist"></ul>';
    result=document.getElementById('resultlist');

    console.log('query:'+query+'');
    fetch(pixabayengine + '?' + 'key=' + apikey + '&' + 'q=' + query).then(response=>response.text()).then(data=>{
        let json = JSON.parse(data);
        console.log('response hits:');
        console.log(json.hits[0]);
        for(let i=0;i<json.hits.length;i++){
            //console.log(typeof json.hits[i]);
            //console.log(json.hits[i]);
            console.log(json.hits[i].webformatURL);
            let img=document.createElement('img');
            let li=document.createElement('li');
            let anchor=document.createElement('a');
            img.setAttribute("src",json.hits[i].webformatURL);
            anchor.setAttribute('href','#');
            anchor.setAttribute('onClick', 'javascript:setResult("'+json.hits[i].webformatURL+'","'+json.hits[i].id+'");');
            anchor.appendChild(img);
            li.appendChild(anchor);
            result.appendChild(li);
        }
    });
}

function searchInGoogle() {
    let query=document.getElementById('query').value;
    let searchengine='https://www.google.com/search?q=';
    let result=document.getElementById('result');

    console.log('query:'+query+'');
    fetch(searchengine + query).then(response => response.text()).then((data)=>{
        let xml=new DOMParser();
        let _div=xml.parseFromString(data, 'text/html');
        let div=_div.getElementsByClassName("yuRUbf");

        result.innerHTML+='<ul>';
        Array.prototype.forEach.call(div, function(element, index){
            let title=element.getElementsByClassName("LC20lb")[0].innerHTML;
            let link=element.getElementsByTagName("a")[0].getAttribute("href");
            result.innerHTML+=`<li><a id='link_${index}' href='javascript:return false;' onclick='clickLinkValue("${link}",${index})'>${title}</a></li>`;
        });
        result.innerHTML+='</ul>';
    });
}
function searchInWebiio() {
    let text=document.getElementById('query').value.replace(' ','+').replace('&','%26');
    let searchengine='https://ejje.weblio.jp/content/';
    let result=document.getElementById('result');
    let queryurl=searchengine + text;

    console.log('query:'+text+'');
    fetch(queryurl).then(response => response.text()).then((data)=>{
        let xml=new DOMParser();
        let _div=xml.parseFromString(data, 'text/html');
        let div=_div.getElementsByClassName("content-explanation");

        let index=0;
        result.innerHTML+='<ul>';
        Array.prototype.forEach.call(div, function(element){
            let title=element.innerText;
            let found=false;

            if(title.search('、')>-1){
                Array.prototype.forEach.call(title.split('、'), function(trText){
                    result.innerHTML+=`<li><a id='link_${index}' href='javascript:return false;' onclick='clickTranslateValue(${index})'>${trText}</li>`;
                    index++;
                });
                found=true;
            }
            if(title.search('。')>-1){
                Array.prototype.forEach.call(title.split('。'), function(trText){
                    result.innerHTML+=`<li><a id='link_${index}' href='javascript:return false;' onclick='clickTranslateValue(${index})'>${trText}</li>`;
                    index++;
                });
                found=true;
            }
            if(title.search('；')>-1){
                Array.prototype.forEach.call(title.split('；'), function(trText){
                    result.innerHTML+=`<li><a id='link_${index}' href='javascript:return false;' onclick='clickTranslateValue(${index})'>${trText}</li>`;
                    index++;
                });
                found=true;
            }
            if(title.search(';')>-1){
                Array.prototype.forEach.call(title.split(';'), function(trText){
                    result.innerHTML+=`<li><a id='link_${index}' href='javascript:return false;' onclick='clickTranslateValue(${index})'>${trText}</li>`;
                    index++;
                });
                found=true;
            }
            if(!found){
                result.innerHTML+=`<li><a id='link_${index}' href='javascript:return false;' onclick='clickTranslateValue(${index})'>${title}</li>`;
                index++;
            }
        });
        result.innerHTML+='</ul>';
    });
}
function clickTranslateValue(index){
    let resultTitle=document.getElementById('resultTitle');
    let linkText=document.getElementById("link_"+index).innerText;
    let linktitle=document.getElementById('linktitle');

    console.log(linkText);
    linktitle.innerText=linkText;
    resultTitle.value=linkText;
    return true;
}
function clickLinkValue(url, index){
    let resultURL=document.getElementById('resultURL');
    let resultTitle=document.getElementById('resultTitle');
    let linktitle=document.getElementById('linktitle');
    let linkid=document.getElementById("link_"+index).innerText;

    console.log(linkid);
    resultURL.value=url;
    linktitle.innerText=linkid;
    resultTitle.value=linkid;
    return true;
}

init();
