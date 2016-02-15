var wsComm = (function () {
  'use strict';
  var _ws = null;
  var _ws_uri = '';
  var _connected = false;
  var _try_reconnect = true;

  var _onMessage = null;

  function _connect() {
    _ws = new WebSocket(_ws_uri);
    _ws.binaryType = 'arraybuffer';
    _ws.onopen = function(evt) { _onOpen(evt); };
    _ws.onclose = function(evt) { _onClose(evt); };
    _ws.onmessage = function(evt) { _onMessage(evt.data); };
    _ws.onerror = function(evt) { _onError(evt); };
  }

  function _onOpen(evt) {
    _connected=true;
  }

  function _onClose(evt) {
    _connected=false;
    if (_try_reconnect) {
        setTimeout( function(){_connect();}, 3000 );
    }
  }

  function _onError(evt) {
    console.log('Error creating Websocket connection: '+evt);
    _connected=false;
    if (_try_reconnect) {
        setTimeout( function(){_connect();}, 3000 );
    }
  }

  var init = function (wsUri, onMessage) {
    _ws_uri = wsUri;
    _onMessage = onMessage;
    _connect();
  };

  var send = function (data) {
    if (_connected) {
        _ws.send(data);
    }
  };

  var close = function () {
    _try_reconnect = false;
    if (_connected) {
        _ws.close();
    }
  };

  return {
    init: init,
    connected: _connected,
    send: send,
    close: close
  };

})();


