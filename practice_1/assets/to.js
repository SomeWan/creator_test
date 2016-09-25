cc.Class({
    extends: cc.Component,

    properties: {

    },

    onLoad: function () {
        //与神同在
        cc.game.addPersistRootNode(this.node);
        
    },

});