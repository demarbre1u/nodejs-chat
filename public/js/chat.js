$(() => {
    $('#login_form').submit(e => {
        e.preventDefault();

        let username = $('#username').val();
        
        // Si l'username saisie n'est pas valide, on ne fait rien
        if(username === '') {
            return;					
        }

        $('#login').hide();
        $('#chat').show();					
        
        let socket = io();    	
        socket.emit('connected', {uname: username});				
    
        // On se connecte au serveur de chat
        $("#form").submit(e => {
            e.preventDefault();
            
            let msg = $('#msg').val();
            
            if(msg != '') {
                socket.emit('sendmsg', {uname: username, message: msg});  
                $('#msg').val('');				
            }
          });	
                
        // Evenement lorsqu'on envoie un nouveau message
        socket.on('newmsg', data => {
            if(data.uname === username) {
                $('#texte').append(`<div class="perso">${timestamp()} <strong> ${data.uname} :</strong> ${data.message} </div>`);
            } else {
                $('#texte').append(`<div>${timestamp()} <strong> ${data.uname} :</strong> ${data.message}</div>`);
            } 

            $('#texte').scrollTop($('#texte')[0].scrollHeight);
        });
    
        // Evenement lorsqu'on reçoit un message système
        socket.on('sysmsg', data => {
            $('#texte').append(`<div class="sys">${timestamp()} ${data.message}</div>`);
            $('#texte').scrollTop($('#texte')[0].scrollHeight);
        });
  
        // Evenement lorsqu'on se déconnecte
        socket.on('disconnect', () => {
            $('#texte').append(`<div class="sys">${timestamp()} You've been disconnected from the server.</div>`);
              $('#texte').scrollTop($('#texte')[0].scrollHeight);
        });      			
      
        // Fonctions qui calcule un timestamp
        let timestamp = () => {
            let date = new Date();

            let hours = date.getHours().toString().length > 1 ? date.getHours() : `0${date.getHours()}`
            let minutes = date.getMinutes().toString().length > 1 ? date.getMinutes() : `0${date.getMinutes()}`
            let seconds = date.getSeconds().toString().length > 1 ? date.getSeconds() : `0${date.getSeconds()}`

            let timestamp = `[${hours}:${minutes}:${seconds}] `;    
            
            return timestamp;
        };
    });
});