jsh.App[modelid] = new (function(){
  var _this = this;

  //Member variables
  this.cust = [];
  this.LOVs = { };

  var CUST_GRID_CONTAINER = '.popup_'+xmodel.class;

  this.showPopup_click = function(){
    //Initialize model
    _this.initCust(function(){
      //Enable the grid (so that navigation events trigger check for updates)
      jsh.XModels['Customer'].controller.grid.Prop.Enabled = true;

      //Update values in Customer grid
      _this.renderCust(function(){
        //Open dialog
        XExt.CustomPrompt(CUST_GRID_CONTAINER, jsh.XDom(CUST_GRID_CONTAINER).element,
        //onInit
        function(xDialogObj){
          //Optional - Attach save / cancel events to dialog events
        },
        //onAccept
        function(success){
          //Executed after save - closes dialog
          success();
        },
        //onCancel
        function(options){
          if(!options.force && jsh.XModels['Customer'].controller.HasUpdates()){
            XExt.Confirm('Close without saving changes?', function(){
              //Reset grid data
              jsh.XModels['Customer'].controller.form.ResetDataset();
              //Close dialog without checking for unsaved changes
              options.forceCancel();
            });
            return false;
          }
        },
        //onClosed
        function(){
          //Disable the grid (so that navigation events do not trigger check for updates)
          jsh.XModels['Customer'].controller.grid.Prop.Enabled = false;
        },
        //options
        { backgroundClose: true, specialKeys: false }
      );
      });
    });
  }

  //Create model, draw controls
  this.initCust = function(callback){
    if(!callback) callback = function(){};

    if('Customer' in jsh.XModels) return callback(); //Grid already loaded

    //Define the grid in-memory
    XPage.LoadVirtualModel(jsh.XDom(CUST_GRID_CONTAINER).element, {
      "id": "Customer",
      "layout": "grid",
      'title': 'Customers',
      "parent": xmodel.id,
      "unbound": true,
      "commitlevel": "page",
      "buttons": [
        {"link": "js:_this.showTestMessage()", "icon": "ok", "actions":"BIU", "text":"Test Message"},
        {"link": "js:_this.save()", "icon": "save", "actions":"IU", "text":"Save"},
        {"link": "js:_this.close()", "icon": "ok", "actions":"IU", "text":"Done"},
      ],
      "hide_system_buttons": ["export"],
      "ejs": "<div class='<%%=model.class%%>_sample_ejs'>Sample EJS for <%%=model.id%%> model</div>",
      "css": ".<%%=model.class%%>_sample_ejs { background-color:#f0f0f0; border:1px solid #bbb; padding:4px 20px; margin-top:10px; }",
      "js": function(){ //This function is virtual and cannot reference any variables outside its scope
        var _this = this;
        //var modelid = [current model id];
        //var xmodel = [current model];
        var apiGrid = new jsh.XAPI.Grid.Static(modelid);
        var apiForm = new jsh.XAPI.Form.Static(modelid);

        _this.oninit = function(xmodel){
          //Custom oninit function
        }

        _this.onload = function(xmodel){
          //Custom onload function
        }

        _this.getapi = function(xmodel, apitype){
          if(apitype=='grid') return apiGrid;
          else if(apitype=='form') return apiForm;
        }

        _this.save = function(){
          jsh.App[xmodel.parent].commitCust();
        }

        _this.close = function(){
          XExt.CancelDialog();
        }

        _this.showTestMessage = function(){
          XExt.Alert('Test Message');
        }
      },
      "oninit":"_this.oninit(xmodel);",
      "onload":"_this.onload(xmodel);",
      "getapi":"return _this.getapi(xmodel, apitype);",
      "fields": [
        {"name": "cust_id", "caption":"Customer ID", "type": "int", "actions":"B", "control":"label", "key": true },
         
        {"name": "cust_name", "caption":"Name", "type": "varchar", "length": 256, "control":"textbox", "validate": ["Required", "MaxLength:256"] },
         
        {"name": "cust_sts", "caption":"Status", "type": "varchar", "length":32, "control":"dropdown", "validate": ["Required"] },
      ]
    }, function(custmodel){
      //Model loaded
      //Connect model dataset with local dataset
      jsh.XModels['Customer'].getapi('grid').dataset = _this.cust;
      jsh.XModels['Customer'].getapi('form').dataset = _this.cust;
      jsh.XModels['Customer'].getapi('form').onInsert = function(action, actionrslt, newrow){
        var max_cust_id = _.max(_.map(_this.cust,function(row){ return row.cust_id; }));
        newrow.cust_id = (max_cust_id||0)+1;
        actionrslt['Customer'] = { cust_id: newrow.cust_id };
      }
      //Get customer data from API
      _this.api_getCust(callback);
    });

  }

  //Render Grid
  this.renderCust = function(onComplete){
    //Apply List of Values
    jsh.XModels['Customer'].controller.setLOV('cust_sts', _this.LOVs.cust_sts);
    jsh.XModels['Customer'].controller.Render(onComplete);
  }

  //Get / Validate Grid Values, Save to In-memory Dataset
  this.commitCust = function(onSuccess){
    jsh.XModels['Customer'].controller.Commit(onSuccess);
  }


  /////////
  // API //
  /////////

  //Get customer status data from the database API
  this.api_getCust = function(onComplete){
    var emodelid = xmodel.namespace+'GridVirtual_Popup_Get_Cust';
    //Execute the GridVirtual_Popup_Get_Cust model
    XForm.prototype.XExecutePost(emodelid, { }, function (rslt) { //On Success
      if ('_success' in rslt) {

        //Populate arrays + Render
        _this.cust.splice(0);
        for(var i=0;i<rslt[emodelid][0].length;i++) _this.cust.push(rslt[emodelid][0][i]);
        if(rslt[emodelid][1]) rslt[emodelid][1].unshift({ code_val: '', code_txt: 'Please select...' });
        _this.LOVs.cust_sts = rslt[emodelid][1];

        if (onComplete) onComplete();
      }
      else XExt.Alert('Error while loading data');
    }, function (err) {
      //Additional error handling
    });
  }

})();
