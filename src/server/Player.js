import CommandHelper from './CommandHelper';

class Player {

  constructor(Game, loadData) {
    this.Game = Game;
    this.CommandHelper = new CommandHelper(this, Game);
    this.socket = null;
    this.onDisconnect = null;
    this.connected = false;
    this.savedData = loadData;
  }

  getGame = () => this.Game

  getCH = () => this.CommandHelper

  registerDisconnect(func) {
    this.onDisconnect = func;
  }

  emit(evt, data) {
    this.socket.emit(evt, data);
  }

  sendText(text) {
    this.emit('text', { text: text });
  }

  handleNewPlayerSuccess() {
    console.log(`[${this.socket.id}] Player created the character ${this.savedData.name}.`);
  }

  handleLoginSuccess() {
    console.log(`[${this.socket.id}] Player logged into character ${this.savedData.name}.`);
    this.sendText('<br>Placing you into the world now.. hold on to your butt..');
    this.emit('loginSuccess');
    this.sendLocation();
    this.showRoomInfo();
  }

  handleDisconnect() {
    this.setConnected(false);
  }

  showRoomInfo() {
    var roomName = this.getCurrentWorld().getRoomNameAt(this.savedData.location.x, this.savedData.location.y);
    var roomDesc = this.getCurrentWorld().getRoomDescAt(this.savedData.location.x, this.savedData.location.y);
    this.sendText(`<br><span class="type-room-name">${roomName}</span>`);
    this.sendText(`<span class="type-room-desc">${roomDesc}</span>`);
  }

  sendLocation() {
    this.emit('location', this.savedData.location);
  }

  setSocket(socket) {
    this.socket = socket;

    this.socket.on('disconnect', () => {
      this.handleDisconnect();
      if(this.onDisconnect !== null) {
        this.onDisconnect(this.socket);
      }
    });

    this.socket.on('getNearbyMapData', this.getNearbyMapData.bind(this));
    this.socket.on('getRoomList', this.getRoomList.bind(this));
    this.socket.on('command', this.getCH().processCommand.bind(this.getCH()));
  }

  setConnected(status) {
    this.connected = status;
  }

  setLocation = (x, y, world) => {
    this.savedData.location = {
      x: x,
      y: y,
      world: ((world) ? world : this.getLocation().world)
    };
  }

  getNearbyMapData() {
    this.emit('map', this.getCurrentWorld().getMapData(this.savedData.currentLocation));
  }

  getRoomList() {
    let playersInRoom = this.getGame().getPlayers().getPlayersInRoom(this.getLocation());
    let response = [];

    playersInRoom.forEach(player => {
      response.push({
        name: player.getName()
      });
    });

    this.emit('roomList', response);
  }

  getCommandAccess = (command) => true

  getOnlineStatus = () => this.connected

  getSocketId = () => this.socket.id

  getSavedData = () => this.savedData

  getName = () => this.savedData.name

  getPassword = () => this.savedData.password

  getCurrentWorld = () => this.getGame().getWorlds().getWorldByName(this.getLocation().world)

  getLocation = () => this.savedData.location
}

export default Player;
