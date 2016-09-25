cc.Class({
    extends: cc.Component,

    properties: {
        label: {
            default: null,
            type: cc.Label,
        },
        
        data: 'good luck sr',
    },

    // use this for initialization
    onLoad: function () {

    },

    sayHi: function () {
        this.label.string = this.data;
    },
    
    toScene2: function () {
        cc.director.loadScene('Scene2');
    },
    
    toScene1: function () {
        cc.director.loadScene('Scene1');
    },
    
});
