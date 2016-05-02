Ext.define('Rally.technicalservices.CardConfiguration',{
    singleton: true,

    fetchFields: ["FormattedID","Name","Feature","Description",
        "Release","PlanEstimate",'c_ExtID01QCRequirement','Requirement'],
                
    displayFields: {
        r1left: { 
            dataIndex: 'FormattedID'
        },
        r1middle: {
            dataIndex: function(recordData) {
                var feature = recordData.get('Feature');
                console.log(recordData);
                
                if ( recordData.get('_type') == 'defect' && recordData.get('Requirement') ) {
                    feature = recordData.get('Requirement').Feature;
                }
                if ( Ext.isEmpty(feature) ) {
                    return ' ';
                }
                
                return feature.FormattedID + ": " + Ext.util.Format.substr(feature.Name,0,5);
            },
            maxLength: 12
        },
        r1right: {
            dataIndex: function(recordData){   
                var release = recordData.get('Release');
                var release_name = "No Release";
                if ( !Ext.isEmpty(release) ) {
                    release_name = release.Name;
                }
                return release_name;
            },
            maxLength: 15
        },
        r2middle: {
            dataIndex: function(recordData) {
                var name = recordData.get('Name');
                var description = recordData.get('Description');
                
                return Ext.String.format('<strong>{0}</strong><br/><br/>{1}',
                    name,
                    description
                );
            }
        },
        r3left: {
            dataIndex: function(recordData) {
                var qc_id = recordData.get('c_ExtID01QCRequirement') || "";
                
                return 'QC: ' + qc_id;
            }
        },
        r3right: {
            dataIndex: function(recordData) {
                return recordData.get('PlanEstimate');
            }
        }
        
    }
});
