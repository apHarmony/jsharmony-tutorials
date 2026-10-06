jsh.App[modelid] = new (function(){
  var _this = this;

  //Member variables
  this.cust = {};
  this.LOVs = { };

  this.onload = function(){
    this.initCust();
  }

  //Create model, draw controls
  this.initCust = function(){
    if('Customer' in jsh.XModels) return; //Form already loaded

    //Define the form in-memory
    XPage.LoadVirtualModel(jsh.XDom('.'+xmodel.class+'_form_container').element, {
      "id": "Customer",
      "layout": "form",
      "parent": xmodel.id,
      "unbound": true,
      "buttons": [{"link": "js:_this.showTestMessage()", "icon": "ok", "actions":"BIU", "text":"Test Message"}],
      "ejs": "<div class='<%%=model.class%%>_sample_ejs'>Sample EJS for <%%=model.id%%> model</div>",
      "css": ".<%%=model.class%%>_sample_ejs { background-color:#f0f0f0; border:1px solid #bbb; padding:4px 20px; margin-top:10px; }",
      "js": function(){ //This function is virtual and cannot reference any variables outside its scope
        var _this = this;
        //var modelid = [current model id];
        //var xmodel = [current model];

        _this.oninit = function(xmodel){
          //Custom oninit function
        }

        _this.onload = function(xmodel){
          //Custom onload function
        }

        _this.save = function(){
          jsh.App[xmodel.parent].commitCust();
        }

        _this.showTestMessage = function(){
          XExt.Alert('Test Message');
        }
      },
      "oninit":"_this.oninit(xmodel);",
      "onload":"_this.onload(xmodel);",
      "fields": [
        {"name": "cust_id", "caption":"Customer ID", "type": "int", "actions":"B",
         "control":"textbox", "controlstyle":"width:80px;", "validate": ["IsNumeric","Required"] },
         
        {"name": "cust_name", "caption":"Name", "type": "varchar", "length": 256, "actions":"B",
         "control":"textbox", "controlstyle":"width:260px;", "validate": ["MaxLength:256","Required"] },
         
        {"name": "cust_sts", "caption":"Status", "type": "varchar", "length":32,
         "control":"dropdown", "validate": ["Required"] },

        {"control":"html","value":"<b>Sample HTML:</b> Content"},

        {"control":"button","value":"Save", "onclick": "js:_this.save();"},
      ]
    }, function(custmodel){
      //Model loaded
      //Get customer data from API
      _this.api_getCust();
    });

  }

  //Render Form
  this.renderCust = function(){
    //Apply List of Values
    jsh.XModels['Customer'].controller.setLOV('cust_sts', _this.LOVs.cust_sts);
    jsh.XModels['Customer'].controller.Render(_this.cust);
  }

  //Get / Validate Form Values, Save to API
  this.commitCust = function(){
    if(!jsh.XModels['Customer'].controller.Commit(_this.cust, 'U')) return;
    _this.api_saveCust();
  }


  /////////
  // API //
  /////////

  //Get customer status data from the database API
  this.api_getCust = function(onComplete){
    var emodelid = xmodel.namespace+'FormVirtual_Standard_Get_Cust';
    //Execute the FormVirtual_Standard_Get_Cust model
    XForm.prototype.XExecutePost(emodelid, { cust_id: jsh._GET.cust_id }, function (rslt) { //On Success
      if ('_success' in rslt) {
        if(!rslt[emodelid][0] || !rslt[emodelid][0].length) return XExt.Alert('Customer not found');

        //Populate arrays + Render
        _this.cust = rslt[emodelid][0][0];
        if(rslt[emodelid][1]) rslt[emodelid][1].unshift({ code_val: '', code_txt: 'Please select...' });
        _this.LOVs.cust_sts = rslt[emodelid][1];

        _this.renderCust();
        if (onComplete) onComplete();
      }
      else XExt.Alert('Error while loading data');
    }, function (err) {
      //Additional error handling
    });
  }

  //Save new customer status to database API
  this.api_saveCust = function(onComplete){
    if(!_this.cust) return XExt.Alert('Customer data not loaded');

    //Execute the FormVirtual_Standard_Update_CustSts model
    var params = {
      cust_id: _this.cust.cust_id,
      cust_sts: _this.cust.cust_sts 
    };
    XForm.prototype.XExecutePost(xmodel.namespace+'FormVirtual_Standard_Update_CustSts', params, function (rslt) { //On Success
      if ('_success' in rslt) {
        //Reload customer data
        _this.api_getCust(onComplete);
      }
      else XExt.Alert('Error while saving data');
    }, function (err) {
      //Additional error handling
    });
  }

})();
