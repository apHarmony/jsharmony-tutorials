
XExt.Request('/_d/jsHarmonyTutorials/FormExec_API_Multirecordset', {
  method: 'POST',
  success: function(rslt){
    jsh.XDom('.API_result').text = JSON.stringify(rslt,null,4);
  }
});
/*
//Alternative syntax using jsHarmony libraries
XForm.prototype.XExecutePost(xmodel.namespace+'FormExec_API_Multirecordset', { }, function (rslt) {
  jsh.XDom('.API_result').text = JSON.stringify(rslt,null,4);
});
*/