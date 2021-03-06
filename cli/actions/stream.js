
var Table = require('cli-table');
var util = require("../util")

module.exports.stream = function (muon, options, args) {
    if (! args[1]) args[1] = '{}';
    var url = args[0];
    var params = JSON.parse(args[1]);
    var auth = options.auth

    muon.subscribe(url,
        auth,
        params,
        function(data) {
          if (options.raw){
            console.log(JSON.stringify(data))
          } else {
            console.dir(data)
          }
        },
        function(error) {
            logger.error("Error reported in the stream: " + JSON.stringify(error))
            util.exit()
        },
        function() {
            logger.debug("Stream is completed by the remote")
            util.exit()
        }
    )
}

module.exports.complete = function (data, done) {
    util.withMuon(function (muon) {
        switch(data.words) {
            case 2:
                var discovery = muon.discovery();

                discovery.discoverServices(function (services) {
                    var serviceList = _.map(services.serviceList, function (service) {
                        return service.identifier
                    });

                    done(null, serviceList);
                    util.exit()
                })
                break
            case 3:
                muon.introspect(data.prev, function (response) {

                    var proto = _.find(response.protocols, function (prot) {
                        return prot.protocolScheme == "reactive-stream"
                    })

                    var endpointList = _.map(proto.operations, function (op) {
                        return op.resource
                    });

                    done(null, endpointList);
                    util.exit()
                })
                break
            default:
                done(null, ["nope"])
                util.exit()
        }
    })
}

module.exports.replay = function (muon, options, args) {
    if (! args[1]) args[1] = '{}';
    var stream = args[0];
    var payload = JSON.parse(args[1]);

    var auth = JSON.parse(options.auth)

    //todo, joi parse the config
    muon.replay(stream,
        auth,
        payload,
        function(data) {
          if (options.raw){
            console.log(JSON.stringify(data))
          } else {
            console.dir(data)
          }
        },
        function(error) {
            logger.error("Error reported in the stream: " + JSON.stringify(error))
            util.exit()
        },
        function() {
            logger.debug("Stream is completed by the remote")
            util.exit()
        }
    )
}
