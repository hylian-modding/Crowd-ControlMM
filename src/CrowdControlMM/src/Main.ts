import { EventsClient, EventHandler } from 'modloader64_api/EventHandler';
import { IModLoaderAPI, IPlugin } from 'modloader64_api/IModLoaderAPI';
import { InjectCore } from 'modloader64_api/CoreInjection';
import { Vote, Option } from './Vote';
import { IMMCore } from 'modloader64_api/MM/Imports';
import { Interpolator } from './Interpolator'
import {
  hurtPlayer, healPlayer, addBankRupees, addRupees, swapZStyle,
  scaleScreenStep, scaleScreen, scaleModelStep, scaleModel,
  motionBlurStep, motionBlur, highFovStep, highFov,
  stopClockStep, stopClock
} from './Commands'

let userData: any = [];
let deltaTime = 0;
let runtime = 0;
let voteInterval = 60;
let isVoting = false;
let voteTime = 30;
let lastVoteTime = 0;
let thisVote: Vote;
let tmiEvt: any;
let framimetime = 1 / 20;

global["updateFunc"] = undefined;
global["updateVars"] = [0 , new Interpolator(), new Interpolator(), new Interpolator()];

export class CrowdControlMM implements IPlugin {
  ModLoader = {} as IModLoaderAPI;
  name = 'CrowdControlMM';

  @InjectCore() core!: IMMCore;

  constructor() {}

  preinit(): void {
    (this.ModLoader.logger as any)['setLevel']('all');
  }

  init(): void {}
  postinit(): void {}

  onTick(): void {
    deltaTime = framimetime;
    runtime += framimetime;

    if (runtime % 20 == 0) {
      this.ModLoader.logger.info("time - votetime: " + (runtime - lastVoteTime).toString() + " votetime: " + thisVote.voteTime)
    }
    
    if (runtime - lastVoteTime > voteInterval && !isVoting) {
      let options: Option[] = [];
      options.push(new Option("Hurt", hurtPlayer));
      options.push(new Option("Heal", healPlayer));
      options.push(new Option("Immediate Pay Day", addRupees));
      options.push(new Option("Pay Day", addBankRupees));
      options.push(new Option("Swap Z-Target Style", swapZStyle));
      options.push(new Option("Shrinking Screen", scaleScreen));
      options.push(new Option("Tiny Lonk", scaleModel));
      options.push(new Option("Cinematic Motion Blur", motionBlur));
      options.push(new Option("Quake Pro", highFov));
      options.push(new Option("stopClock", stopClock));
      thisVote = new Vote(options, voteTime, "Vote on which effect to apply!", tmiEvt);
      isVoting = true;
    }

    if (thisVote) {
      thisVote.update(tmiEvt, runtime, deltaTime);

      if (thisVote.voteTime <= 0 || thisVote.killMe) {
        let result = thisVote.getResult();
        tmiEvt.reply("Vote ended! Result is " + result.name)
        global["updateFunc"] = result.func(this.ModLoader.emulator, runtime);

        //@ts-ignore
        thisVote = undefined;
        isVoting = false;
        lastVoteTime = runtime;
      }
    }

    if (global["updateFunc"]) global["updateFunc"](this.ModLoader.emulator, runtime, deltaTime);
  }

  @EventHandler("TMI:onCheer")
  onCheer(evt: any) {
    addRupees(this.ModLoader.emulator, evt.tags.bits);
  }

  @EventHandler("TMI:onMessage")
  onMessage(evt: any) {
    let uId = evt.tags.id;
    let params = evt.msg.split(' ');

    if (params[0] == "!points") {
      evt.reply("You have " + (userData[uId] ? userData[uId].points : 0).toString() + " points!");
    }

    if (params[0] == "!vote" && thisVote)
    {
      let voteNum = parseInt(params[1]);
      if (!thisVote.addVote(uId, voteNum)) {
        evt.reply("Voting failed!")
      }
      else {
        evt.reply("You have successfully voted on " + thisVote.options[voteNum].name + "!");
      }
    }

    if (params[0] == "!rvote" && thisVote) {
      evt.reply("Removing vote!");
      thisVote.removeVote(uId);
    }

    if (params[0] == "!helpvote" && thisVote) {
      thisVote.redescribe();
    }

    if (params[0] == "!help") {
      evt.reply("Command prefix is !, commands: points, vote, rvote, helpvote")
    }
  }

  @EventHandler("TMI:onConfig")
  onConfig(evt: any) {
        evt.say("Majoras Mask Crowd Control by Drahsid and Denoflions started!");
        tmiEvt = evt;
  }

  @EventHandler(EventsClient.ON_INJECT_FINISHED)
  onClient_InjectFinished(evt: any) {}
}
