import {
  EventsClient,
  EventServerJoined,
  EventServerLeft,
  EventHandler,
  EventsServer,
} from 'modloader64_api/EventHandler';
import { IModLoaderAPI, IPlugin } from 'modloader64_api/IModLoaderAPI';
import {
  ILobbyStorage,
  INetworkPlayer,
  LobbyData,
  NetworkHandler,
  ServerNetworkHandler,
} from 'modloader64_api/NetworkHandler';
import { InjectCore } from 'modloader64_api/CoreInjection';
import { Packet } from 'modloader64_api/ModLoaderDefaultImpls';
import * as Net from './network/Imports';

export class _name_ implements IPlugin {
  ModLoader = {} as IModLoaderAPI;
  name = '_name_';

  @InjectCore() core!: _core_;

  // Storage Variables
  db = new Net.DatabaseClient();
  
  constructor() {}

  preinit(): void {}

  init(): void {}

  postinit(): void {}

  onTick(): void {
    // You would detect game data and react to it here.

    // EX: Sending packet from client to server -- sending some important game data changes.
    // this.ModLoader.clientSide.sendPacket(new Net.MyTcpPacket("anyDataHere", this.ModLoader.clientLobby));
  }

  @EventHandler(EventsClient.ON_INJECT_FINISHED)
  onClient_InjectFinished(evt: any) {}

  @EventHandler(EventsServer.ON_LOBBY_CREATE)
  onServer_LobbyCreate(lobby: string) {
    this.ModLoader.lobbyManager.createLobbyStorage(
      lobby, 
      this, 
      new Net.DatabaseServer()
    );
  }

  @EventHandler(EventsClient.CONFIGURE_LOBBY)
  onLobbySetup(lobby: LobbyData): void {
    // Can set configurable settings for a host of
    // lobby to set for a play session. EX: combination with
    // below On_Lobby_Join event.

    // lobby.data['_name_:data1_syncing'] = true;
    // lobby.data['_name_:data2_syncing'] = true;
  }

  @EventHandler(EventsClient.ON_LOBBY_JOIN)
  onClient_LobbyJoin(lobby: LobbyData): void {
    this.db = new Net.DatabaseClient();

    // Can configure LobbyData here -- Allow hostable settings
    // and lobby based triggers. EX: combination with above
    // Configure_Lobby event.

    // this.LobbyConfig.data1_syncing = lobby.data['_name_:data1_syncing'];
    // this.LobbyConfig.data2_syncing = lobby.data['_name_:data2_syncing'];
    // this.ModLoader.logger.info('OotOnline settings inherited from lobby.');
  }

  @EventHandler(EventsServer.ON_LOBBY_JOIN)
  onServer_LobbyJoin(evt: EventServerJoined) {}

  @EventHandler(EventsServer.ON_LOBBY_LEAVE)
  onServer_LobbyLeave(evt: EventServerLeft) {
    let storage: Net.DatabaseServer = this.ModLoader.lobbyManager.getLobbyStorage(evt.lobby, this) as Net.DatabaseServer;
  }

  @EventHandler(EventsClient.ON_SERVER_CONNECTION)
  onClient_ServerConnection(evt: any) {}

  @EventHandler(EventsClient.ON_PLAYER_JOIN)
  onClient_PlayerJoin(nplayer: INetworkPlayer) {}

  @EventHandler(EventsClient.ON_PLAYER_LEAVE)
  onClient_PlayerLeave(nplayer: INetworkPlayer) {}

  // #################################################
  // ##  Server Receive Packets
  // #################################################

  @ServerNetworkHandler('MyTcpPacket')
  onServer_MyTcpPacket(packet: Net.MyTcpPacket): void {
    this.ModLoader.logger.info('[Server] Received: {MyTcpPacket}');
    let storage: Net.DatabaseServer = this.ModLoader.lobbyManager.getLobbyStorage(packet.lobby, this) as Net.DatabaseServer;

    // EX: Sending packet from server to client
    // this.ModLoader.serverSide.sendPacket(new Net.MyTcpPacket("anyDataHere", packet.lobby));
  }

  @ServerNetworkHandler('MyUdpPacket')
  onServer_MyUdpPacket(packet: Net.MyUdpPacket): void {
    this.ModLoader.logger.info('[Server] Received: {MyUdpPacket}');
    let storage: Net.DatabaseServer = this.ModLoader.lobbyManager.getLobbyStorage(packet.lobby, this) as Net.DatabaseServer;
  }

  // #################################################
  // ##  Client Receive Packets
  // #################################################

  @NetworkHandler('MyTcpPacket')
  onClient_MyTcpPacket(packet: Net.MyTcpPacket): void {
    this.ModLoader.logger.info('[Client] Received: {MyTcpPacket}');

    // EX: Sending packet from client to server
    // this.ModLoader.clientSide.sendPacket(new Net.MyTcpPacket("anyDataHere", packet.lobby));
  }
  
  @NetworkHandler('MyUdpPacket')
  onClient_MyUdpPacket(packet: Net.MyUdpPacket): void {
    this.ModLoader.logger.info('[Client] Received: {MyUdpPacket}');
  }
}
