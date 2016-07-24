/* WHO NEEDS JQUERY NOT ME THAT'S FOR SURE */
window.onload = function () {
  var showMailElement = document.getElementById("show-mail");
  showMailElement.onclick = function() {
    window.open('http://www.google.com/recaptcha/mailhide/d?k\x3d01qkz0Fr_I3f4cZ0kd1x_7gw\x3d\x3d\x26c\x3dfPANp7eN-f9ECrEMMHqKkGkSd9MbKvYG_mvaYu6rS7s\x3d', '', 'toolbar=0,scrollbars=0,location=0,statusbar=0,menubar=0,resizable=0,width=500,height=300');
    return false;
  };
}
