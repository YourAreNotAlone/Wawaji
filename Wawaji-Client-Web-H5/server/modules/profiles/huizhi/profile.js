
const vault = require('./vault.js')
const WawajiStatus = require('../../constants').WawajiStatus;
const request = require('request');

const ACTION = {
    LEFT:  'SXActionLeft',
    RIGHT: 'SXActionRight',
    UP:    'SXActionFront',
    DOWN:  'SXActionBack',
    CATCH: 'SXActionFetch'
};

const OPERATION = {
    CONNECT:    'webConnectWithBinDataStr',
    CHECKCONN:  'webCheckConnect',
    DISCONN:    'webDisConnect',
    SENDACTION: 'webSendAction',
    CHECKHAND:  'webCheckHand'
};

var debug = true;
var dbg = function () {
    if (debug) {
        var x = [];
        for (var i in arguments) x.push(arguments[i]);
        console.log.apply(null, ['Agora Huizhi profile dbg :'].concat(x));
    }
};

HuizhiProfile = function (mode) {
    var profile = this;
    this.machine = null;
    this.appid = vault.appid;
    this.appcert = vault.appcert;
    this.url = vault.url;
    this.http_url = vault.http_url;
    this.video_channel = vault.video_channel;
    this.video_host = vault.video_host;
    this.video_rotation = vault.video_rotation;
    this.stream_secret = vault.stream_secret;
    this.mode = mode;
    this.actions = {};
    this.dyn_key = '';
    this.binstr  = vault.binstr;
    this.password = vault.password;

    this.onInit = function(machine, done){
        dbg("onInit.");
        profile.machine = machine;

        var dst_url = profile.http_url + OPERATION.CONNECT;
        request.post({url:dst_url, form:{binStr:profile.binstr, pass:profile.password}}, function (err, response, body) {
            var msg = JSON.parse(body);
            if (msg) {
                if (msg.code >= 0) {
                    profile.dyn_key = msg.data;
                    dbg("Response: dynKey=" + profile.dyn_key);

                    done();
                }
                else {
                    dbg("Response ERROR:" + msg.mess);
                }
            }
        });
    }

    this.onDisconnect = function () {
        dbg("onDisconnect.");

        var dst_url = profile.http_url + OPERATION.DISCONN;
        request.post({url:dst_url, form:{binStr:profile.binstr, pass:profile.password}}, function (err, response, body) {
            var msg = JSON.parse(body);
            if (msg) {
                if (msg.code >= 0) {
                    dbg("Response: " + msg.mess);
                }
                else {
                    dbg("Response ERROR:" + msg.mess);
                }
            }
        });
    }

    this.onPlay = function(account){

    }

    this.onControl = function(data){
        dbg("onControl: " + data);

        var action = '';
        switch (data.data) {
            case 'left':  action = ACTION.LEFT;  break;
            case 'right': action = ACTION.RIGHT; break;
            case 'up':    action = ACTION.UP;    break;
            case 'down':  action = ACTION.DOWN;  break;
            default: break;
        }
        var dst_url = profile.http_url + OPERATION.SENDACTION;
        request.post({url:dst_url, form:{binStr:profile.binstr, pass:profile.password, dynKey:profile.dyn_key, action:action}}, function (err, response, body) {
            var msg = JSON.parse(body);
            if (msg) {
                if (msg.code >= 0) {
                    dbg("Response: " + msg.mess);
                }
                else {
                    dbg("Response ERROR: " + msg.mess);
                }
            }
        });
    }

    this.onCatch = function(){
        dbg("onCatch.");

        var action = ACTION.CATCH;
        var dst_url = profile.http_url + OPERATION.SENDACTION;
        request.post({url:dst_url, form:{binStr:profile.binstr, pass:profile.password, dynKey:profile.dyn_key, action:action}}, function (err, response, body) {
            var msg = JSON.parse(body);
            if (msg) {
                if (msg.code >= 0) {
                    dbg("Response: " + msg.mess);
                }
                else {
                    dbg("Response ERROR: " + msg.mess);
                }
            }
            // Reset Connection
            profile.onDisconnect();
            setTimeout(profile.onInit, 5000);
        });
    }

}

module.exports = HuizhiProfile;

