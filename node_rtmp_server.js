//
//  Created by Mingliang Chen on 17/8/1.
//  illuspas[a]gmail.com
//  Copyright (c) 2017 Nodemedia. All rights reserved.
//
const Logger = require('./logger');

const Net = require('net');
const NodeRtmpSession = require('./node_rtmp_session');
const NodeCoreUtils = require('./node_core_utils');
const tls = require('tls');
const fs = require('fs');

const context = require('./node_core_ctx');

const RTMP_PORT = 1935;

const options = {
	// key: fs.readFileSync('certificate.pem'),
	// cert: fs.readFileSync('certrequest.csr')
};

class NodeRtmpServer {
  constructor(config) {
    config.rtmp.port = this.port = config.rtmp.port ? config.rtmp.port : RTMP_PORT;
    this.tcpServer = Net.createServer(options, (socket) => {
      let session = new NodeRtmpSession(config, socket);
      session.run();
    })
  }

  run() {
    this.tcpServer.listen(this.port, '0.0.0.0', () => {
      Logger.log(`Node Media Rtmp Server started on port: ${this.port}`);
    });

    this.tcpServer.on('error', (e) => {
      Logger.error(`Node Media Rtmp Server ${e}`);
    });

    this.tcpServer.on('close', () => {
      Logger.log('Node Media Rtmp Server Close.');
    });
  }

  stop() {
    this.tcpServer.close();
    context.sessions.forEach((session, id) => {
      if (session instanceof NodeRtmpSession) {
        session.socket.destroy();
        context.sessions.delete(id);
      }
    });
  }
}

module.exports = NodeRtmpServer;
