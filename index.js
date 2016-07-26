/* WHO NEEDS JQUERY NOT ME THAT'S FOR SURE */
window.onload = function () {
  //Set up mailhide
  var showMailElement = document.getElementById("show-mail");
  var mailUrl = 'http://www.google.com/recaptcha/mailhide/d?k\x3d01qkz0Fr_I3f4cZ0kd1x_7gw\x3d\x3d\x26c\x3dfPANp7eN-f9ECrEMMHqKkGkSd9MbKvYG_mvaYu6rS7s\x3d';
  var mailOptions = 'toolbar=0,scrollbars=0,location=0,statusbar=0,menubar=0,resizable=0,width=500,height=300';
  showMailElement.onclick = function() {
    window.open(mailUrl, '', mailOptions);
    return false;
  };
  
  //Google Analytics
  (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
  (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
  m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
  })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');
  
  ga('create', 'UA-81356040-1', 'auto');
  ga('send', 'pageview');
}
