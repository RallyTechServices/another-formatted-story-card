Ext.define('Rally.technicalservices.CardTemplate',{
    extend: 'Ext.XTemplate',

    constructor: function(config) {

        this.callParent([
            '<div class="artifact">',
                '<div class="r1">',
                    '<tpl if="this.displayFields.r1left>',
                        '<span class="r1left">{[this.getContent(values, this.displayFields.r1left)]}</span>',
                    '</tpl>',
                    '<tpl if="this.displayFields.r1middle">',
                        '<span class="r1middle">{[this.getContent(values, this.displayFields.r1middle)]}</span>',
                    '</tpl>',
                    '<tpl if="this.displayFields.r1right">',
                        '<span class="r1right">{[this.getContent(values, this.displayFields.r1right)]}</span>',
                    '</tpl>',
                '</div>',
                
                '<div class="r2">',
                    '<tpl if="this.displayFields.r2middle">',
                        '<span class="r2middle">{[this.getContent(values, this.displayFields.r2middle)]}</span>',
                    '</tpl>',
                '</div>',
                
                '<div class="r3">',
                    '<tpl if="this.displayFields.r3left>',
                        '<span class="r3left">{[this.getContent(values, this.displayFields.r3left)]}</span>',
                    '</tpl>',
                    '<tpl if="this.displayFields.r3right">',
                        '<span class="r3right">{[this.getContent(values, this.displayFields.r3right)]}</span>',
                    '</tpl>',
                '</div>',
            '</div>',

            {
                getContent: function(recordData, displayField) {

                    var val = recordData.get(displayField.dataIndex) || "&nbsp;";
                    if (displayField){
                        if (Ext.isFunction(displayField.dataIndex)){
                            val = displayField.dataIndex(recordData);
                        } else {
                            val = recordData.get(displayField.dataIndex) || "&nbsp;";
                        }
                        
                        if (displayField.maxLength > 0){
                            val = Ext.String.ellipsis(val, displayField.maxLength, false);
                        }
                    }
                    //console.log('getContent', recordData, displayField, val);
                    return val;
                },
                displayFields: config.displayFields
            }
        ]);
    }
});