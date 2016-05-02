Ext.define("TSPrintStoryCards", {
    extend: 'Rally.app.App',
    componentCls: 'app',
    logger: new Rally.technicalservices.Logger(),
    defaults: { margin: 10 },

    layout: 'hbox',
    
    integrationHeaders : {
        name : "TSPrintStoryCards"
    },
                        
    launch: function() {
        
        this.add({
            xtype:'rallyiterationcombobox',
            fieldLabel: 'Iteration:',
            labelWidth: 55,
            width: 200
        });
        
        this.add({
            xtype: 'rallybutton',
            text:'Print Cards',
            listeners: {
                scope: this,
                click: this._printCards
            }
        });
        
    },
    
    _printCards: function() {
        var me = this;
        
        var iteration = this.down('rallyiterationcombobox').getRecord();
        if ( iteration ) {
            var iteration_name = iteration.get('Name');
            this.logger.log('Print Stories from Iteration: ', iteration);
            
            var story_config = {
                model: 'HierarchicalRequirement',
                filters: [{property:'Iteration.Name',value:iteration_name}],
                fetch: Rally.technicalservices.CardConfiguration.fetchFields
            };
            var defect_config = {
                model: 'Defect',
                filters: [{property:'Iteration.Name',value:iteration_name}],
                fetch: Rally.technicalservices.CardConfiguration.fetchFields
            };
            
            Deft.Chain.parallel([
                function() { return me._loadWsapiRecords(story_config); },
                function() { return me._loadWsapiRecords(defect_config); }
            ]).then({
                scope: this,
                success: function(items){
                    this._openPrintCards(Ext.Array.flatten(items));
                },
                failure: function(msg) {
                    Ext.Msg.alert('Problem loading items', msg);
                }
            });
        }
    },
    
    _loadWsapiRecords: function(config){
        var deferred = Ext.create('Deft.Deferred');
        var me = this;
        var default_config = {
            model: 'Defect',
            fetch: ['ObjectID']
        };
        this.logger.log("Starting load:",config.model);
        Ext.create('Rally.data.wsapi.Store', Ext.Object.merge(default_config,config)).load({
            callback : function(records, operation, successful) {
                if (successful){
                    deferred.resolve(records);
                } else {
                    me.logger.log("Failed: ", operation);
                    deferred.reject('Problem loading: ' + operation.error.errors.join('. '));
                }
            }
        });
        return deferred.promise;
    },
    
    _openPrintCards: function(records){
        this.logger.log('_openPrintCards', records);
        
        var fields =[{
            dataIndex: 'Name',
            maxLength: 200,
            cls: 'card-title'
        },{
            dataIndex: 'FormattedID',
            cls: 'card-id'
        }];
//
        var win = Ext.create('Rally.technicalservices.window.PrintCards',{
            records: records,
            displayFields: fields,
            currentDocument: Ext.getDoc()
        });
        
        win.show();
        win.print();
    },

    _loadAStoreWithAPromise: function(model_name, model_fields){
        var deferred = Ext.create('Deft.Deferred');
        var me = this;
        this.logger.log("Starting load:",model_name,model_fields);
          
        Ext.create('Rally.data.wsapi.Store', {
            model: model_name,
            fetch: model_fields
        }).load({
            callback : function(records, operation, successful) {
                if (successful){
                    deferred.resolve(this);
                } else {
                    me.logger.log("Failed: ", operation);
                    deferred.reject('Problem loading: ' + operation.error.errors.join('. '));
                }
            }
        });
        return deferred.promise;
    },
    
    getOptions: function() {
        return [
            {
                text: 'About...',
                handler: this._launchInfo,
                scope: this
            }
        ];
    },
    
    _launchInfo: function() {
        if ( this.about_dialog ) { this.about_dialog.destroy(); }
        this.about_dialog = Ext.create('Rally.technicalservices.InfoLink',{});
    },
    
    isExternal: function(){
        return typeof(this.getAppId()) == 'undefined';
    },
    
    //onSettingsUpdate:  Override
    onSettingsUpdate: function (settings){
        this.logger.log('onSettingsUpdate',settings);
        // Ext.apply(this, settings);
        this.launch();
    }
});
