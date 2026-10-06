jsh.App[modelid] = new (function(){
  var _this = this;

  //Member variables
  this.cust = [];
  this.LOV = { };
  this.dragTarget = null;
  this.dragType = '';
  this.dragStarted = false;
  this.dragStartTime = 0;
  this.dragDestination = null;

  this.oninit = function(xmodel){
    //Bind event handlers
    var xdDoc = jsh.XDom(document);
    xdDoc.on('mousemove', _this.onmousemove);
    xdDoc.on('mouseup', _this.onmouseup);
    //Load API Data
    this.loadData();
  }

  this.ondestroy = function(){
    //Remove any bound event handlers
    var xdDoc = jsh.XDom(document);
    xdDoc.off('mousemove', _this.onmousemove);
    xdDoc.off('mouseup', _this.onmouseup);
  }

  //Launch Help form
  this.help = function(){
    XExt.popupForm('/jsHarmonyFactory/Help_Listing', 'update', { help_target_code: 'FormCustom' });
  }

  //Get customer status data from the database API
  this.loadData = function(onComplete){
    var emodelid = xmodel.namespace+'FormCustom_Get_Cust';
    //Execute the FormCustom_Get_Cust model
    XForm.prototype.XExecutePost(emodelid, { }, function (rslt) { //On Success
      if ('_success' in rslt) {
        //Populate arrays + Render
        _this.cust = rslt[emodelid][0];
        _this.LOV.cust_sts = rslt[emodelid][1];

        _this.render();
        if (onComplete) onComplete();
      }
      else XExt.Alert('Error while loading data');
    }, function (err) {
      //Optionally, handle errors
    });
  }

  //Save new customer status to database API
  this.updateStatus = function(cust_id, cust_sts, onComplete){
    //Execute the FormCustom_Update_CustSts model
    XForm.prototype.XExecutePost(xmodel.namespace+'FormCustom_Update_CustSts', { cust_id: cust_id, cust_sts: cust_sts }, function (rslt) { //On Success
      if ('_success' in rslt) {
        //Re-render
        _this.loadData(onComplete);
      }
      else XExt.Alert('Error while saving status');
    }, function (err) {
      //Optionally, handle errors
    });
  }

  //Re-render Customer Status interface
  this.render = function(){
    //Create array of customers per customer status
    var data = { 
      cust_sts: [] 
    };
    _.each(_this.LOV.cust_sts, function(cust_sts){
      var cust_per_sts = [];
      _.each(_this.cust, function(cust){ if(cust.cust_sts==cust_sts.code_val) cust_per_sts.push(cust); });
      data.cust_sts.push(_.extend({}, cust_sts, { cust: cust_per_sts }));
    });
    //Render the EJS template
    var tmpl = jsh.xd('.'+xmodel.class+'_template').innerHTML;
    var xdcontainer = jsh.xd('.'+xmodel.class+'_container');
    xdcontainer.html = XExt.renderClientEJS(tmpl, { data: data, _: _, jsh: jsh });
    //Bind mousedown event for dragging
    xdcontainer.get('.'+xmodel.class+'_customer').on('mousedown', this.onmousedown_customer);
  }

  //Handler for "mousedown" event on a customer element
  this.onmousedown_customer = function(e){
    if(e.which==1){//left mouse button
      e.preventDefault();
      e.stopPropagation();
      _this.dragTarget = jsh.XDom(e.target);
      _this.dragType = 'cust';
      _this.dragBegin();
    }
  }

  //Handler for "mousemove" event
  this.onmousemove = function(e){
    if(_this.dragTarget){ _this.dragMove(); }
  }

  //Handler for "mouseup" event
  this.onmouseup = function(e) {
    if(_this.dragTarget){
      _this.dragEnd();
      _this.dragTarget = null;
      e.preventDefault();
      e.stopPropagation();
    }
  }

  //Mouse Drag - Fired on start of drag event
  this.dragBegin = function(){
    jsh.XDom('.xcontext_menu').style.display = false;
    _this.dragStarted = true;

    if(_this.dragType=='cust'){
      jsh.xd('.'+xmodel.class+'_customer.drag').remove();
      var xdclone = jsh.XDom(jsh.XDom.render(_this.dragTarget.outerHTML));
      xdclone.style.position = 'absolute';
      xdclone.style.zIndex = 999;
      xdclone.style.left = jsh.mouseX;
      xdclone.style.top = jsh.mouseY;
      xdclone.class.add('drag');
      jsh.xdroot.prepend(xdclone);
    }
  }

  //Mouse Drag - Fired each time the mouse moves
  this.dragMove = function(){
    if(!_this.dragTarget) return;

    if(_this.dragType=='cust'){
      //Update dragged object position
      var xdclone = jsh.xd('.'+xmodel.class+'_customer.drag');
      xdclone.style.left = jsh.mouseX;
      xdclone.style.top = jsh.mouseY;

      //Highlight background on target container
      var cust_sts = '';
      jsh.xd('.'+xmodel.class+'_status_container').elements.forEach(function(obj){
        if(XExt.isMouseWithin(obj)){
          cust_sts = jsh.XDom(obj).data.code_val;
        }
      });
      if(cust_sts) _this.dragDestination = jsh.xd('.'+xmodel.class+'_status_container[data-code_val='+cust_sts+']');
      else _this.dragDestination = jsh.XDom([]);

      jsh.xd('.'+xmodel.class+'_status_container').omit(_this.dragDestination.element).class.remove('highlighted');
      _this.dragDestination.class.add('highlighted');
    }
  }

  //Mouse Drag - Fired on complete of drag event
  this.dragEnd = function(){
    if(!_this.dragStarted) return;

    if(_this.dragType=='cust'){
      jsh.xd('.'+xmodel.class+'_customer.drag').remove();
      jsh.xd('.'+xmodel.class+'_status_container').class.remove('highlighted');
      if(_this.dragDestination){
        var cust_id = _this.dragTarget.data.cust_id;
        var cust_sts = _this.dragDestination.data.code_val;
        //Update status
        _this.updateStatus(cust_id, cust_sts); 
      }
    }

  }

})();
