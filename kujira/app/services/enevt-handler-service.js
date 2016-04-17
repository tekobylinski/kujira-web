import Ember from 'ember';
import io from 'socket.io';
import ENV from 'kujira/config/enviroment';

export default Ember.Service.extend(Ember.Evented, {
    socket: null,
    events: ["osdAdded", "osdRemoved", "OSDup", "OSDdown", "OSDrebalanced"],

    onInit: function() {
        this.get('socket').set(io.connect(ENV.APP.API_HOST, ENV.APP.API_PORT, ENV.APP.API_NAMESPACE));
        var socket = this.get('socket');
        socket.on('eventNotification', this.eventNotification, this);
        socket.on('close', function() {
              this.get('socket').set(io.connect(ENV.APP.API_HOST, ENV.APP.API_PORT, ENV.APP.API_NAMESPACE));
        }, this);
    }.on('init'),

    eventNotification: function(message) {
        var obj = JSON.parse(message);
        var objMessage=obj.eventType;
        var tmp =Ember.$.inArray(objMessage, this.get('events'));
            if (tmp) {
                this.trigger(objMessage, obj);
            }
    },

    joinGraph: function(graphType){
        var socket = this.get('socket');
        socket.emit('join',graphType);
        socket.on('graphNotification',this.graphNotification, this);
    },

    closeGraph: function(graphType){
        var socket = this.get('socket');
        socket.emit('leave',graphType);
    },

    graphNotification: function(event){
        var obj =JSON.parse(event);
        var data=[obj.X,obj.Y];
        this.trigger(obj.graphType,data);
    }
});
