var dataReloadLogin = document.querySelectorAll("[data-reload-login]");
var language = {
    it:{
        myFavoriteMemorylink : "Eventi Importanti Nella Storia",
        email1 : "E-mail",
        password :"Parola D'ordine",
        rememberme :"Ricordati Di Me", 
        login : "Login",
        signup : "Iscriviti",
        comfirmpassword : "Confermare Parola D'ordine",
        continue :"Continua"
    },
    tr : {
        myFavoriteMemorylink :"Tarihteki Önemli Olaylar",
        email1 : "E-posta",
        password :"Şifre",
        rememberme :"Beni Hatırla", 
        login : "Giriş",
        signup : "Kayıt Ol",
        comfirmpassword : "Şifre Onayla",
        continue :"Devam et"
    }
};

if(window.location.hash ){
    if(window.location.hash ==="#tr" ){
        header.textContent = language.tr.myFavoriteMemorylink;  
        emaillogin.textContent = language.tr.email1;
        emailregister.textContent = language.tr.email1;
        passwordlogin.textContent = language.tr.password;
        passwordregister.textContent = language.tr.password;
        rememberme.textContent = language.tr.rememberme;
        loginswitch.textContent = language.tr.login;
        loginbutton.textContent = language.tr.login;
        signup.textContent = language.tr.signup;
        comfirmpassword.textContent = language.tr.comfirmpassword;
        continue1.textContent = language.tr.continue;
           
    }
}

for(i=0; i<= dataReloadLogin.length; i++)
{
    dataReloadLogin[i].onclick = function(){
        setTimeout(function(){
            console.log("selam")
            location.reload();
        },100);
    }; 
}