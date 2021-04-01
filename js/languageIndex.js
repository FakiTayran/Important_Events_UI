var dataReload = document.querySelectorAll("[data-reload]");
var language = {
    it:{
        memoryLink : "I Miei Ricordi",
        homeContent : "Casa" ,
        searchContent : "Ricerca",
        filters : "Filtri",
        type : "Genere",
        all : "Tutte",
        dayOfMonth : "Giorno Del Mese",
        day : "Giorno",
        month : "Mese",
        colDate :"Data",
        colEvent : "Genere",
        colDescription :"Descrizione",
        colFavorite :"Preferita",
        PreValue : "Pre",
        nextValue : "LL Prossimo"
    },
    tr : {
        memoryLink : "Favori Anılarım",
        homeContent : "Ana Sayfa",
        searchContent : "Arama",
        filters : "Filtreler",
        type : "Tip",
        all : "Hepsi",
        dayOfMonth : "Ayın Günleri",
        day : "Gün",
        month : "Ay",
        colDate :"Gün",
        colEvent : "Tür",
        colDescription :"Açıklama",
        colFavorite :"Favori",
        PreValue : "Önceki",
        nextValue : "Sonraki"
    }
};

if(window.location.hash ){
    if(window.location.hash ==="#tr" ){
        myFavoriteMemorylink.textContent = language.tr.memoryLink;
        home.textContent = language.tr.homeContent;
        search.textContent = language.tr.searchContent;
        filters.textContent = language.tr.filters;
        type.textContent = language.tr.type;
        all.textContent = language.tr.all;
        dayOfMonth.textContent  = language.tr.dayOfMonth;
        day.textContent  = language.tr.day;
        month.textContent = language.tr.month;
        colDate.textContent = language.tr.colDate; 
        colEvent.textContent = language.tr.colEvent;
        colDescription.textContent = language.tr.colDescription;
        colFavorite.textContent = language.tr.colFavorite;
        PreValue.textContent = language.tr.PreValue;
        nextValue.textContent = language.tr.nextValue;
    }
}

for(i=0; i<= dataReload.length; i++)
{
    dataReload[i].onclick = function(){
        setTimeout(function(){
            console.log("selam")
            location.reload();
        },100);
    }; 
}



