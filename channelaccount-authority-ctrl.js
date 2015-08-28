module.exports = function(ngModule) {   
   ngModule.controller('ChannelAccountAuthorityCtrl', function($scope,$localStorage,$log,$modalInstance,Constants,item,ModuleService) {
        var self = this;

        var renameNodes = function (nodes) {
            var collapsed = false
                ,childallcheck = true
                ,checked = true;
            angular.forEach(nodes, function(nodelv1){
                angular.forEach(nodelv1.moduleDatas, function(nodelv2){
                    angular.forEach(nodelv2.functions, function(nodelv3){
                        nodelv3.itempkey = angular.copy(nodelv3.functioncode);
                        nodelv3.itemname = angular.copy(nodelv3.functiondesc);
                        delete nodelv3.functioncode;
                        delete nodelv3.functiondesc;
                        nodelv3.collapsed = collapsed;
                        nodelv3.childallcheck = childallcheck;
                        nodelv3.checked = checked;
                    });
                    nodelv2.itempkey = angular.copy(nodelv2.modulepkey);
                    nodelv2.itemname = angular.copy(nodelv2.modulename);
                    nodelv2.nodes = angular.copy(nodelv2.functions);
                    delete nodelv2.modulepkey;
                    delete nodelv2.modulename; 
                    delete nodelv2.functions;
                    nodelv2.collapsed = collapsed;
                    nodelv2.childallcheck = childallcheck;
                    nodelv2.checked = checked;                                                           
                });
                nodelv1.itempkey = angular.copy(nodelv1.modulepkey);
                nodelv1.itemname = angular.copy(nodelv1.modulename);
                nodelv1.nodes = angular.copy(nodelv1.moduleDatas);
                delete nodelv1.modulepkey;
                delete nodelv1.modulename;                 
                delete nodelv1.moduleDatas;
                nodelv1.collapsed = collapsed;
                nodelv1.childallcheck = childallcheck;
                nodelv1.checked = checked;                                 
            });
            return nodes;
        };

      //  var getCheckStyleForNode = function(node){
      //       var nodeIconElem = angular.element("[data-itempkey=" + node.itempkey + "] > span");
      //       nodeIconElem
      //           .removeClass("glyphicon-ok")
      //           .removeClass("glyphicon-minus");
      //       if(node.checked === true && node.childallcheck === true){
      //           nodeIconElem.addClass("glyphicon-ok");
      //       }else if(node.checked === true && node.childallcheck === false){
      //           nodeIconElem.addClass("glyphicon-minus");                    
      //       }
      //  };

      //  var verifyCheckStyleForNode = function(node){
      //       var nodeIconElem = angular.element("[data-itempkey=" + node.itempkey + "] > span");
      //       if(node.checked === false){
      //           nodeIconElem.removeClass("glyphicon-minus");
      //       }         
      //  };

        var handleRootNodes = function(nodes){
            angular.forEach(nodes, function(nodelv1){
                var childallcheck = true;
                var checked = false;

                angular.forEach(nodelv1.nodes, function(nodelv2){
                    angular.forEach(nodelv2.nodes, function(nodelv3){
                        childallcheck = childallcheck & nodelv3.checked;
                    });
                    childallcheck = childallcheck & nodelv2.checked;
                });
                
                angular.forEach(nodelv1.nodes, function(nodelv2){
                    checked = checked | nodelv2.checked;                  
                });

                nodelv1.childallcheck = Boolean(childallcheck);
                nodelv1.checked = Boolean(checked);
                
                //getCheckStyleForNode(node);
            });
        };

        var handleParentNode = function(parent){
            if(parent){
                parent.childallcheck = _.every(parent.nodes,"checked",true);
                parent.checked = !(_.every(parent.nodes,"checked",false));
                //getCheckStyleForNode(parent);
                //verifyCheckStyleForNode(parent);                
            }
        };

        var handleChildNode = function(node){
            if(_.has(node,"nodes")){
                angular.forEach(node.nodes, function(cnode){
                    cnode.checked = node.checked;
                    handleChildNode(cnode);
                });
            }
            //verifyCheckStyleForNode(node);
        };

        self.modalTitle = "權限設定";
        self.item = angular.copy(item);
        self.errorMessage = "";

        self.loadData = function(){
            var modules = [];
            if(!_.isEmpty($localStorage.authdata)){
                self.logintype = $localStorage.authdata.logintype;
                ModuleService
                    .getModules(item.pkey) 
                    .success(function(res){
                        var modules = res.list;
                        //var modules = $localStorage.authdata.modules;
                        self.modules = renameNodes(modules);
                        $log.debug(self.modules);
                    });
            }
        };

        self.displayIcon = function(node){
            var strclass = "";
            if(node.checked === true && node.childallcheck === true){
               strclass = "glyphicon-ok";
            }else if(node.checked === true && node.childallcheck === false){
               strclass = "glyphicon-minus";
            }else{
               strclass = "";
            }
            return strclass;
        };

        self.doCheck = function(scope,node){
            var parent = scope.$parent.$parent.node;
            var checkstatus = node.checked;
            node.checked = !checkstatus;
            if(node.nodes){
                node.childallcheck = !checkstatus;
            }
            handleChildNode(node);
            handleParentNode(parent);
            handleRootNodes(self.modules);
        };

        self.ok = function() {
            var postarry = [];
            angular.forEach(self.modules, function(nodelv1){
               if(nodelv1.checked){
                  postarry.push({modulepkey:nodelv1.modulepkey});
               }
               angular.forEach(nodelv1,function(nodelv2){
                  angular.forEach(nodelv2,function(nodelv3){
                     if(nodelv3.checked){
                        postarry.push({
                           modulepkey:nodelv3.modulepkey,
                           functioncode:nodelv3.functioncode
                        });
                     }
                  });                  
               });
            }
            $modalInstance.close();
        };

        self.cancel = function() {
            $modalInstance.dismiss('cancel');
        };
    });
};
