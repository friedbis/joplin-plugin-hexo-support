import joplin from "api";

function URIencode(query:string){
	let encquery=encodeURIComponent(query);
	return encquery.replace("'", "%27");
}
function URIdecode(encquery: string){
	let decquery=decodeURIComponent(encquery);
	return decquery.replace("%27", "'");
}

function saveImageFile(formdata: any){
	let imageURL = formdata.resultURL;
	let imageTitle = formdata.resultTitle;

	fetch(imageURL).then(response=>{
		return response.blob();
	}).then(blob=>{
		return URL.createObjectURL(blob);
	}).then(async data=>{
		console.log(data);
		console.log(imageURL);
		console.log(imageTitle);
		await joplin.data.post(
			["resources"],
			null,
			{title: imageTitle+'.jpg'},
			[
				{
					Blob: data,
				}
			]
		);
	});
}

function returnQuery(formdata: any){
	return (formdata.resultTitle!=="")?formdata.resultTitle:URIdecode(formdata.query);
}

function generateLink(formdata: any, genType = ''){
	let link=formdata.resultTitle;
	let url=formdata.resultURL;

	if(link===""){
		return URIdecode(formdata.query);
	}else{
		return ((genType==="img"||genType==="image")?"!":"")+"["+link+"]"+"("+url+")";
	}
}

function showDialog(selected: string, dlgTitle: string, apikey: string){
	let query=URIencode(selected);
	let htmlquery=`<input id='query' type='hidden' name='query' value='${query}'>`;

	return `
	<h1 id='dlgtitle'>${dlgTitle}</h1>
	<h2 id='linktitle'></h2>
	<div id='result'></div>
	<form id='formdata' name='formdata'>
	<input id='resultURL' name='resultURL' type='hidden' value=''>
	<input id='resultTitle' name='resultTitle' type='hidden' value=''>
	${htmlquery}
	<input id='APIKey' name='APIKey' type='hidden' value='${apikey}'>
	</form>
	`;
}

function wrapToDoAlarmTag(selected: string|null){
	let start = selected.search(/^[at]:/);
	let end = selected.search(/[^\s](?=[\s ]*$)/);
	let extracted = selected.slice(start + 2, end + 1);
	console.log(start);
	console.log(end);
	console.log(extracted);
	if(selected.search(/^a:/)>-1){
		return `<span class="alarm">`+extracted+`</span>`;
	}
	if(selected.search(/^t:/)>-1){
		return `<span class="todo">`+extracted+`</span>`;
	}
}

function wrapSelectionWithStrings(selected: string|null){
	// Determine host info and throw into subfunc
	for(const host in hostList){
		const objHost = hostList[host];
		if(selected.search(objHost.hostname)>-1){
			console.log('Detected ['+objHost.name+']');
			return _wrapSelectionWithStrings(selected, objHost);
		}
		if(objHost.anotherHostname!==""&&selected.search(objHost.anotherHostname)>-1){
			console.log('Detected ['+objHost.name+']');
			return _wrapSelectionWithStrings(selected, objHost);
		}
		if(selected.search(objHost.name)>-1){
			console.log('Detected ['+objHost.name+']');
			return _wrapSelectionWithStrings(selected, objHost);
		}
	}
}

function _wrapSelectionWithStrings(selected: string|null, Host: any) {
	if (!selected) selected = Host.defaultURL;

	// Remove white space on either side of selection
	const start = selected.search(/[^\s]/);
	const end = selected.search(/[^\s](?=[\s]*$)/);
	const core = selected.slice(start,  end + 1);

	// Translate URL <-> TagOWL
	if (core.startsWith(Host.wrapString1) && core.endsWith(Host.wrapString2)) {
		console.log('TagOWL -> URL');
		const inside = core.slice(Host.wrapString1.length, core.length - Host.wrapString2.length);
		const defaulturl = Host.defaultURL.replace(DEFAULTID, inside);
		console.log('['+defaulturl+']');
		return defaulturl;
	} else {
		console.log('URL -> TagOWL');
		let mediaid;
		if(selected.search(Host.hostname)>0){
			mediaid=getMediaId(selected, Host.hostname, Host.queryString);
		}
		if(selected.search(Host.anotherHostname)>0){
			mediaid=getMediaId(selected, Host.anotherHostname, Host.queryString);
		}
		const tagowl=selected.slice(0, start) + Host.wrapString1 + mediaid + Host.wrapString2 + selected.slice(end + 1);
		console.log('['+tagowl+']');
		return tagowl;
	}
}

function getMediaId(selected: string, hostname: string, queryString: string){
	// Parse URL
	let parse: URL;
	try {
		console.log('Parsing URL');
		parse = new URL(selected);
	}catch(err){
		console.log('Error parsing URL');
		return '**error**';
	}

	if(parse.hostname.search(hostname)<0){
		console.log('Invalid hostname');
		return '**error**';
	}

	// Parse mediaid
	if(queryString!==""){
		console.log('Parsing MediaID');
		const start = parse.search.search(queryString);
		if(start>-1){
			const params = parse.searchParams;
			const query = queryString.replace('=','').replace('?','');
			return params.get(query);
		}
	}

	// Parse pathname
	console.log('Parsing pathname');
	const pathArray = parse.pathname.split('/');
	if(pathArray[pathArray.length-1]!==''){
		if(hostname.search('giphy')>-1)
			return pathArray[pathArray.length-2];
		else
			return pathArray[pathArray.length-1];
	}else{
		return pathArray[pathArray.length-2];
	}
}

export const actions = {
	textHexoTagOwl: {
		parseFormType: 'hexo-tag-owl',
		iconName: 'fas fa-percent',
		accelerator: 'CmdOrCtrl+Shift+W',
		execute: wrapSelectionWithStrings,
		label: 'Hexo Tag Owl',
		showDialog: false,
		parseFormData: null,
		apikey: null,
	},
	textGoogleSearch: {
		parseFormType: 'google-search',
		iconName: 'fab fa-google',
		accelerator: 'CmdOrCtrl+Shift+G',
		execute: showDialog,
		label: 'Google Search',
		showDialog: true,
		parseFormData: generateLink,
		apikey: null,
	},
	textTranslate: {
		parseFormType: 'translate',
		iconName: 'fas fa-globe',
		accelerator: 'CmdOrCtrl+Shift+E',
		execute: showDialog,
		label: 'Translate',
		showDialog: true,
		parseFormData: returnQuery,
		apikey: null,
	},
	imageSearch: {
		parseFormType: 'image search',
		iconName: 'fas fa-file-image',
		accelerator: 'CmdOrCtrl+Shift+X',
		execute: showDialog,
		label: 'Image Search',
		showDialog: true,
		parseFormData: saveImageFile,
		apikey: null,
	},
	insertToDoAlarm: {
		parseFormType: 'ToDo Alarm',
		iconName: 'fas fa-bullhorn',
		accelerator: 'CmdOrCtrl+Shift+R',
		execute: wrapToDoAlarmTag,
		label: 'ToDo Alarm',
		showDialog: false,
		parseFormData: null,
		apikey: null,
	},
};

export const hostList = {
	YouTube: {
		name: 'youtube',
		wrapString1: '{% owl youtube ',
		wrapString2: ' %}',
		defaultURL: 'https://www.youtube.com/watch?v=NNNNNNNN',
		hostname: 'youtube.com',
		anotherHostname: 'youtu.be',
		queryString: 'v=',
	},
	DailyMotion: {
		name: 'dailymotion',
		wrapString1: '{% owl dailymotion ',
		wrapString2: ' %}',
		defaultURL: 'https://www.dailymotion.com/video/NNNNNNNN',
		hostname: 'dailymotion.com',
		anotherHostname: '',
		queryString: '',
	},
	NicoNico: {
		name: 'niconico',
		wrapString1: '{% owl niconico ',
		wrapString2: ' watch %}',
		defaultURL: 'https://www.nicovideo.jp/watch/NNNNNNNN',
		hostname: 'nicovideo.jp',
		anotherHostname: 'nico.ms',
		queryString: '',
	},
	vimeo: {
		name: 'vimeo',
		wrapString1: '{% owl vimeo ',
		wrapString2: ' %}',
		defaultURL: 'https://vimeo.com/NNNNNNNN',
		hostname: 'vimeo.com',
		anotherHostname: '',
		queryString: '',
	},
	IMDB: {
		name: 'imdb',
		wrapString1: '{% owl imdb ',
		wrapString2: ' %}',
		defaultURL: 'https://www.imdb.com/title/NNNNNNNN/?ref_=ext_shr_lnk',
		hostname: 'imdb.com',
		anotherHostname: '',
		queryString: '',
	},
	GIPHY: {
		name: 'giphy',
		wrapString1: '{% owl giphy ',
		wrapString2: ' %}',
		defaultURL: 'https://media.giphy.com/media/NNNNNNNN/giphy.gif',
		hostname: 'giphy.com',
		anotherHostname: '',
		queryString: '',
	},
	Imgur: {
		name: 'imgur',
		wrapString1: '{% owl imgur ',
		wrapString2: ' %}',
		defaultURL: 'https://imgur.com/gallery/NNNNNNNN',
		hostname: 'imgur.com',
		anotherHostname: '',
		queryString: '',
	},
};

export const DTI_SETTINGS_PREFIX	  = 'hexoSupport.';
export const ACTIVATE_ONLY_SETTING	= 'activateOnlyIfEnabledInMarkdownSettings';
export const IMAGE_SEARCH_APIKEY_SETTING = 'apiKeyForImageSearch';
export const DEFAULTID				= 'NNNNNNNN';

export default {
	actions,
	DTI_SETTINGS_PREFIX,
	ACTIVATE_ONLY_SETTING,
	IMAGE_SEARCH_APIKEY_SETTING
}
