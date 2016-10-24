Ext.define("TSPrintStoryCards", {
    extend: 'Rally.app.App',
    componentCls: 'app',
    logger: new Rally.technicalservices.Logger(),
    defaults: { margin: 10 },

    layout: 'vbox',
    
    integrationHeaders : {
        name : "TSPrintStoryCards"
    },
    
    config: {
        defaultSettings: {
            selectorType: null
        }
    },
    
    launch: function() {

        if (this.getSetting('selectorType')){
            var container = this.add({
                xtype:'container',
                layout: 'hbox'
            });

            container.add({
                xtype:'rallyiterationcombobox',
                fieldLabel: 'Iteration:',
                margin: 10,
                labelWidth: 55,
                width: 275,
                allowClear: true
            });

            container.add({
                xtype: 'portfolioitemselector',
                context: this.getContext(),
                type: this.getSetting('selectorType'),
                stateful: false,
                stateId: this.getContext().getScopedStateId('app-selector'),
                width: '75%',
                margin: 10,
                fieldLabel: this.getSetting('selectorType').replace(/PortfolioItem\//,'') + ":"
            });

            this.add({
                xtype: 'rallybutton',
                text:'Print Cards',
                listeners: {
                    scope: this,
                    click: this._printCards
                }
            });

        } else {
            this.add({
                xtype: 'container',
                html: '<div class="no-data-container"><div class="secondary-message">Please configure the app settings and choose a selector type.</div></div>'
            });
        }


    },
    
    _printCards: function() {
        var me = this;
        
        var iteration = this.down('rallyiterationcombobox').getRecord();
        var pi = this.down('portfolioitemselector').getRecord();
        
        this.logger.log('pi:', pi);
        
        var filters = {};
        
        if ( iteration ) {
            var iteration_name = iteration.get('Name');
            this.logger.log('Print Items from Iteration: ', iteration);
            filters.story  = Ext.create('Rally.data.wsapi.Filter',{property:'Iteration.Name',value:iteration_name});
            filters.defect = Ext.create('Rally.data.wsapi.Filter',{property:'Iteration.Name',value:iteration_name});
        }
        
        if ( pi && pi.get('ObjectID') > 0 ) {
            this.logger.log('Print Items from PI:', pi.get('_refObjectName'));
            var story_filters = Rally.data.wsapi.Filter.or([
                {property:'Feature.ObjectID',value:pi.get('ObjectID')},
                {property:'Feature.Parent.ObjectID',value:pi.get('ObjectID')},
                {property:'Feature.Parent.Parent.ObjectID',value:pi.get('ObjectID')}
            ]);
            
            if ( !Ext.isEmpty(filters.story) ) {
                filters.story = filters.story.and(story_filters);
            } else {
                filters.story = story_filters;
            }
            
            filters.defect = { property:'ObjectID', value: 0 }; // can't query defects on pi
            
        }
        
        if (!Ext.isEmpty(filters) && filters != {} && !Ext.isEmpty(filters.story) ) {

            var story_config = {
                model: 'HierarchicalRequirement',
                filters: filters.story,
                fetch: Rally.technicalservices.CardConfiguration.fetchFields
            };
            
            var defect_config = {
                model: 'Defect',
                filters: filters.defect,
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
    },
    
    getSettingsFields: function() {
        return [{
            name: 'selectorType',
            xtype: 'rallycombobox',
            allowBlank: false,
            autoSelect: false,
            fieldLabel: 'Selector Type',
            //context: context,
            storeConfig: {
                model: Ext.identityFn('TypeDefinition'),
                sorters: [{ property: 'Ordinal' }],
                fetch: ['DisplayName', 'ElementName', 'TypePath', 'Parent', 'UserListable'],
                filters: [{property: 'TypePath', operator: 'contains', value: 'PortfolioItem/'}],
                autoLoad: false,
                remoteFilter: true
            },
            displayField: 'DisplayName',
            valueField: 'TypePath',
            readyEvent: 'ready'
        }];
    }
});
