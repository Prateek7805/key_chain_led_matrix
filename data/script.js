var dat = [];
var Socket;
var curDisp = "";
function doc(i){
    return document.getElementById(i);
}
function dc(c, i){
    i = i||0;
    return document.getElementsByClassName(c)[i];
}
function dn(n, i){
    i=i||0;
    return document.getElementsByName(n)[i];
}
function er(msg){
    console.log(msg);
}
function encS(txt){
    var len =txt.length;
    var encodedString = "";
    for(var i=0; i<len; i++){
        var c = txt.charCodeAt(i);
        if(c>=32){
        if(c<=47 || (c >= 58 && c<=64) || (c>=91 && c<=96) || (c>=123 && c<=126)){
            encodedString+='%'+c.toString(16);
        }else{
            encodedString+=txt[i];
        }
        }
    }
    er(encodedString);
    return encodedString;
}
function _s(h, d){
    d = d||'';
    Socket.send(h+d);
}
function err(m, level){
    level = level||3;
    var color = (level == 1)? "#f55c47" : (level == 2)? "#4aa96c" : "#564a4a"; 
    doc("currentText").style.color = color;
    if(level == 3){
        doc("currentText").innerHTML = "Currently Displaying: "+ m;
        curDisp = m;
    }else{
        doc("currentText").innerHTML = m;
    }
}
function errr(m){
    doc('err').style.color = '#FF0000'
    doc('err').innerHTML = m;
}
function dae({id, e, fn}){
    doc(id).addEventListener(e, fn);
}
function animate({timing, draw, duration}) {
    let start = performance.now();
    requestAnimationFrame(function animate(time) {
        let timeFraction = (time - start) / duration;
        if (timeFraction > 1) timeFraction = 1;
        let progress = timing(timeFraction)
        draw(progress);
        if (timeFraction < 1) {
        requestAnimationFrame(animate);
      }
    });
}

dae({id : 'gear',e : 'click', fn : navAni});

function navAni(){
    var cond = doc('gear').checked == true; 
    var conN = (cond)? "content": "contentNav";
    var conB = (cond)? "contentNav" : "content";
    
    animate({
        duration: 1500,
        timing: function(timeFraction) {
            return val = (1/(1+Math.exp(-(30*timeFraction-5))));
            
        },
        draw: function(progress) {
            var angle = Math.round(((cond)? progress: 1-progress)*180);
            doc('s-i').style.transform = 'rotate('+(angle)+'deg)';
            
            if(progress < 0.5){
                dc(conN).style.opacity = (1-(progress*2)); 
               
            }else{
                dc(conN).style.display = 'none';
                dc(conB).style.display = 'block';
                dc(conB).style.opacity = (progress-0.5)*2; 
            }
        }
    });
}

function xr({url, fun}){
    xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function(){
        if(this.readyState == 4 && this.status == 200){
            fun(this);
        }
    }
    xhr.open('GET', url, true);
    xhr.send();
}
document.addEventListener('DOMContentLoaded', function(){
    
    var timeout = 250;
    function connect() {
        Socket = new WebSocket('ws://'+window.location.hostname+':81/');
        Socket.onmessage = function(event){
            er(event.data);
        }
        Socket.onopen = function(){
            er("Socket connected.");
        }
        Socket.onclose = function(e) {
          er('Socket is closed. Reattempting..');
          setTimeout(function() {
            connect();
          }, Math.min(10000, timeout));
        };
      
        Socket.onerror = function(err) {
          console.error('Socket encountered error: ', err.message, 'Closing socket');
          Socket.close();
        };
    }
      connect();
    xr({
        url:"/name",
        fun : (self)=>{
            initFlags(self);
            xr({
                url : "/init",
                fun : upDiv
            });
        }
    });
}, false);

function initFlags(self){
    var iflag = JSON.parse(self.responseText);
    err(valid(iflag[0]));
    doc("speed").value = invSpeed(iflag[1]);
    doc("speedVal").innerHTML = Math.round(invSpeed(iflag[1])/10);
    doc("bright").value = iflag[2];
    doc("brightVal").innerHTML = iflag[2];
    doc(iflag[3]).checked = true;
    if(iflag[4] != 0){doc('A-EN').innerHTML = 'Disable'; doc('AO-t').innerHTML = 'Time interval: '+parseInt(iflag[4]/60000);}         
}
function upDiv(self){
    var txt = self.responseText.substring(0,self.responseText.length - 2) + "]";
    er(txt);
    dat = JSON.parse(txt);
    dc("data").innerHTML = "";
    er(dat);
    for(var i = 0; i<dat.length; i++){
        datBox('d',i);
    }
}


doc('enterText').addEventListener('keyup', function(e){
    if(e.key == 'Enter'){
        submit();
    }
});

dae({id:'submitText',e:'click',fn:submit});

function submit(){
    var txt = doc("enterText").value;
    txt = txt.trim();
    if(!txt.match(/^[^\n]{1,1024}$/) || (txt.length == 0)){
        err('Enter text in range 0-1024',1);
        return;
    }
    var len = dat.length;
    for(var i = 0; i<len; i++){
        if(dat[i] == txt){
            doc("enterText").value = "";
            btn("i"+i);
            return;
        }
    }
    xr({
        url : '/input?q='+encS(txt),
        fun:(self)=>{           
            dat[dat.length] = txt;
            var key = 'd'
            if(doc('rn-b').checked)
                key = 'r';
            else if(doc('de-b').checked)
                key = 'D';
            datBox(key, dat.length - 1);
            err(valid(txt));
            doc("enterText").value = '';
        }
    });
}

function valid(txt){
    txt = txt.trim();
    if(txt.length > 20){
        txt = txt.substring(0,20) + "...";
    }
    return txt;
}

function datBox(c, t){
    var home = "<div class='datarow'><div class='dataCol-l'><button class='enBtn' id= 'i"+t+"' onclick = btn(this.id)>"+valid(dat[t])+"</button></div><div class='dataCol-r'>{{data}}</div></div>";
    var key;
    if(c == 'd'){
        key = '';
    }else if(c == 'D'){
        key =  "<button class='delButton t-txt' id='d"+t+"' onclick = del(this.id)>Delete</button>";
    }else{
        key = "<button class='rnButton t-txt' id='r"+t+"' onclick = rn(this.id)>Rename</button>";
    }
    dc("data").innerHTML += home.replace('{{data}}', key);
}

function btn(id){
    id = id.substring(1);
    id = parseInt(id);
    xr({url : '/exist?q='+encS(dat[id]),
    fun : (self)=>{
        err(valid(dat[id]));
    }});
}

dae({id:'speed',e:'change',fn:upCur});

dae({id : 'speed', e : 'input', fn : function(){
    doc("speedVal").innerHTML = Math.round((this.value)/10);
    _s('s', gspeed(this.value));
}});

dae({id:'bright',e:'change',fn:upCur});

dae({id : 'bright',e : 'input', fn : function(){
    doc("brightVal").innerHTML = this.value;
    _s('b', this.value);
}});

function upCur(){
    xr({
        url : '/curr',
        fun : (self)=>{}
    });
}

function gspeed(x){
    return parseInt((1000 - (1000*Math.exp(-0.006*x))));
}

function invSpeed(x){
    return parseInt(-Math.log((1000-x)/1000)/0.006);
}

dae({id:'rn-b',e:'click',fn:ctrl});
dae({id:'de-b',e:'click',fn:ctrl});

function ctrl(){
    var key = '';
    if(this.id == 'rn-b'){
        key = 'r';
        doc('de-b').checked = false;
    }else{
        key = 'D';
        doc('rn-b').checked = false;
    }
    var len = dat.length;
    dc("data").innerHTML = "";
    key = (this.checked)? key : 'd';
    for(var i=0; i<len; i++)
        datBox(key, i);
}

function rn(id){
    id = parseInt(id.substring(1))
    var len = dat.length;
    dc("data").innerHTML = "";
    for(var i = 0; i<len; i++){
        if(i == id){
            dc("data").innerHTML+="<div class='datarow'><div class='dataCol-l'><textarea id='i"+i+"' oninput='textarea(this)'>"+(dat[i])+"</textarea></div><div class='dataCol-r'><button class='btn' id='b"+i+"' onclick='rbtn(this.id)'>Done</button></div></div>";
            doc('i'+i).style.width = 'auto';
            doc('i'+i).style.height = doc('i'+i).scrollHeight + 'px';
        }else{
            datBox('r',i);
        }
    }
}

function textarea(self){
    self.style.height = self.scrollHeight + 'px';
}

function rbtn(id){
    id=parseInt(id.substring(1));
    er(id);
    var len = dat.length; 
    if(doc("i"+id).value.length == 0){
        err("Enter some text", 1);
        doc('rn-b').checked = false;
        dc("data").innerHTML = "";
        for(var i=0; i<len; i++)
            datBox('d',i);
    }else{
        var ind = (dat[id] == curDisp)? 1 : 0;
        dat[id] = doc("i"+id).value;

        xr({url: '/rn?q1='+id+'&q2='+encS(dat[id])+'&q3='+ind,
            fun: (self)=>{
                if(ind == 1) err(dat[id]);
                dc("data").innerHTML = "";
                for(var i=0; i<len; i++)
                    datBox('r',i);
            }});
        }
}
function del(id){
    id= parseInt(id.substring(1));
    var ind = (curDisp!='')? (curDisp == dat[id])? 0 : dat.indexOf(curDisp) : 0;
    er(ind);
    if(dat.length > 1){
        xr({
            url : '/del?q1='+id + '&q2=' + ind,
            fun : (self)=>{
                err(valid(dat[ind]));
                dc("data").innerHTML = "";
                dat.splice(id,1);
                var len = dat.length;
                for(var i = 0; i < len; i++){
                    datBox('D',i);
                }
            }
        });
    }else{
        err("Atleast one text required", 1);
    }
}

dn("wifi").addEventListener('change', wifiMode);
dn("wifi",1).addEventListener('change', wifiMode);
function wifiMode(){
    _s(this.value);
}



function RD(self){
    if(self.id == 'RD')
        self.parentElement.innerHTML = "<p class='t-center t-f'>Are you Sure?</p><div class='my r2'><div class='c2'><button id='RDY' class='center d-table g-button g-red' onclick=\"RD(this); _s('RD');\">Yes</button></div><div class='c2'><button id='RDY' class='center d-table g-button g-green' onclick='RD(this)'>No</button></div></div>";
    else{
        if(self.id == 'RDY'){
            xr({
                url:"/name",
                fun: (self) => {
                    var jT = JSON.parse(self.responseText);
                    er(jT);
                    initFlags(self);
                    dc("data").innerHTML = "";
                    dat = [];
                    dat[0] = jT[0];
                    datBox('d',0);
                }
            });
            self.parentElement.parentElement.parentElement.innerHTML = "<button class='g-button g-orange d-table center' id='RD' onclick = 'RD(this)'>Reset</button>";
        }
    }
}

function AO(self){
    var val = doc('AO-t').innerHTML;
    var val = val.substring(val.indexOf(':')+2);
    if(self.id == 'A-EN'){
        if(self.innerHTML == 'Enable' && val != ''){
            self.innerHTML = 'Disable';
            _s('A', val);
        }
        else{
            self.innerHTML = 'Enable';
            _s('A', '0');
        }    
    }else if(self.id == 'A-SET'){
        self.parentElement.parentElement.parentElement.innerHTML = "<div class='d-table center'><input type= 'number' placeholder='Enter time' id='A-txt' class='txt' min='1' step = '1' oninput='AO(this)'><button id='A-SUB' class='g-button mx g-green' onclick='AO(this)'>cancel</button></div>";  
    }else if(self.id =='A-txt'){ 
        if(!self.value.match(/^[1-9]\d*$/)){
            errr('Please Enter a valid number');
            self.value = "";
            doc('A-SUB').innerHTML = 'cancel';
        }else{
            errr('');
            doc('A-SUB').innerHTML = 'set';
        }
    }
    else{
        val = doc('A-txt').value;
        if(val != ''){
            doc('AO-t').innerHTML = 'Time interval: ' + val;
        }
        self.parentElement.parentElement.innerHTML = "<div class='r2'><div class='c2'><button class='center d-table g-button g-green' id='A-EN' onclick = 'AO(this)'>Enable</button></div><div class='c2'><button id='A-SET' class='center d-table g-button g-green' onclick = 'AO(this)'>Set</button></div></div>";
    }
}

dae({id:'WP-b',e:'click',fn:function(){
    var ssid = doc('WP-ssid');
    var pass = doc('WP-pass');
    er(ssid.value);
    er(pass.value);
    if(!ssid.value.match(/^[A-z0-9_]{1,32}$/)){
        errr('Please Enter valid SSID');
        ssid.value = '';
        return;
    }if((pass.value.length>0) && !pass.value.match(/^[^\n ]{8,63}$/)){
        errr('please enter a password between 8 and 63 characters');
        pass.value = '';
        return;
    }
    errr('');
    _s('WP',ssid.value+','+pass.value);
    ssid.value = '';
    pass.value = '';
}});

function WO(self){
    var home = "<button class='g-button g-orange d-table center' onclick='WO(this)' id='WO'>PowerDown</button>";
    if(self.id == 'WO'){
        self.parentElement.innerHTML = "<p class='t-center my t-f'>Do you want to turn on the WiFi after some time?</p><div class='r2'><div class='c2'><button class='center d-table g-button g-green' id='WO-Y' onclick = 'WO(this)'>Yes</button></div><div class='c2'><button id='WO-N' class='center d-table g-button g-red' onclick = 'WO(this)'>No</button></div></div>";
    }else if(self.id == 'WO-N'){
        self.parentElement.parentElement.parentElement.innerHTML = home;
        _s('WO', '0');
    }else if(self.id== 'WO-Y'){
        self.parentElement.parentElement.parentElement.innerHTML = "<p class='t-center t-f'>Enter time after which WiFi powers on</p><div class='d-table center my'><input type= 'number' placeholder='Enter time' id='WO-txt' class='txt' min='1' step = '1' oninput='WO(this)'><button id='WO-S' class='g-button g-green mx' onclick = 'WO(this)'>cancel</button></div>";
    }else if(self.id == 'WO-txt'){
        if(!self.value.match(/^[1-9]\d*$/)){
            errr('Please Enter a valid time in minutes');
            self.value = "";
            doc('WO-S').innerHTML = 'cancel';
        }else{
            errr('');
            doc('WO-S').innerHTML = 'set';
        }
    }else{
        var val = doc('WO-txt').value;
        self.parentElement.parentElement.innerHTML = home;
        if(val != ''){
            _s('WO', val);
        } 
    }
}

dae({id:'RS',e:'click',fn:RS});
dae({id:'RS-txt',e:'input',fn:RS});
dae({id:'RS-D',e:'click',fn:RS});

function RS(){
    var val = doc('RS-txt').value;
    if(this.id == 'RS-txt'){
        if(!val.match(/^[1-9]\d*$/)){
            errr('Enter valid time in minutes');
            this.value = '';
            doc('RS-D').innerHTML = '&#8734;';
        }else{
            doc('RS-D').innerHTML = 'Set';
            errr('');
        }
    }else if(this.id == 'RS'){
        _s('RSR');
    }else{
        if(val != ''){
            this.innerHTML = '&#8734;';
            doc('RS-txt').value = '';
            _s('RSD', val);
            
        }else{
            _s('RSD', '0');
        }
    }
}

dae({id:'d-off',e:'click', fn:function(){
    var state = this.checked;
    xr({
        url : '/off?q=' + ((state)? 0 : 1),
        fun : (self) => {
            dc('d-off').innerHTML = state? 'On' : 'Off';
        }
    })
}});