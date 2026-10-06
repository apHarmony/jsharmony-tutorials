jsh.App[modelid] = new (function(){
  var _this = this;

  //On form load
  this.onload = function(xmodel,callback){
    _this.render_cust_desc_editor();
  }

  //On drop-down value change
  this.cust_desc_editor_type_change = function(obj,newval,e){
    _this.render_cust_desc_editor();
  }

  this.render_cust_desc_editor = function(){
    //Get the value of the dropdown
    var cust_desc_editor_type = xmodel.get('cust_desc_editor_type');

    if(cust_desc_editor_type=='HTML'){
      //If we should render an HTML editor
      //Add an "id" attribute to the cust_desc textarea, because it does not have one by default
      jsh.XDom('.cust_desc.xelem'+xmodel.class).attr.id = xmodel.class+'_cust_desc';
      //Initialize the editor on the cust_desc textarea
      XExt.CKEditor(xmodel.class+'_cust_desc');
    }
    else {
      //Otherwise, remove the CKEditor if it is currently displayed
      //Get the CKEditor object
      var editor_id = xmodel.class+'_cust_desc';
      var editor = (window.CKEDITOR?window.CKEDITOR.instances[editor_id]:undefined);
      if(editor){
        //Remove the editor
        editor.destroy();
      }
    }
  }

})();
