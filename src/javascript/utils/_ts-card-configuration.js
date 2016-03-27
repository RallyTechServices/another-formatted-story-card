Ext.define('Rally.technicalservices.CardConfiguration',{
    singleton: true,

    fetchFields: ["FormattedID","Name","State","Owner","Description",
        "Notes","Milestones","TargetDate","Project",'c_MoSCoW'],
    
    
    displayFields: {
        r1left: { 
            dataIndex: 'FormattedID'
        },
        r1middle: {
            dataIndex: function(recordData) {
                var feature = recordData.get('Feature');
                if ( Ext.isEmpty(feature) ) {
                    return ' ';
                }
                
                return feature.FormattedID + ": " + feature.Name;
            },
            maxLength: 12
        },
        r1right: {
            dataIndex: function(recordData){   
                var release = recordData.get('Release');
                var release_name = "No Release";
                if ( !Ext.isEmpty(release) ) {
                    release_name = Ext.util.Format.ellipsis(release.Name,12);
                }
                return release_name;
            }
        },
        r2middle: {
            dataIndex: function(recordData) {
                var description = recordData.get('Description');
                
                if ( Ext.isEmpty(description) ) {
                    return "--";
                }
                
                return description.replace(/<(?:.|\n)*?>/gm, '');
            },
            maxLength: 325
        },
        r3middle: {
            dataIndex: function(recordData) {
                return 'abc'
            },
            maxLength: 255
        }
    }
});
