import { newPhoneProp, removePhoneProp } from '../functions';
import { Delay } from '../../utils/fivem';

export enum AnimationState {
  ON_CALL,
  PHONE_OPEN,
  ON_CAMERA,
}

export class AnimationService {
  private animationInterval: NodeJS.Timeout;
  private onCall = false;
  private phoneOpen = false;
  private onCamera = false;

  private createAnimationInterval() {
    this.animationInterval = setInterval(async () => {
      const playerPed = PlayerPedId();
      if (this.onCall) {
        this.handleCallAnimation(playerPed);
      } else if (this.phoneOpen && !this.onCamera) {
        this.handleOpenAnimation(playerPed);
      }
    }, 250);
  }

  private setPhoneState(state: AnimationState, stateValue: boolean) {
    switch (state) {
      case AnimationState.ON_CALL:
        this.onCall = stateValue;
        break;
      case AnimationState.PHONE_OPEN:
        this.phoneOpen = stateValue;
        break;
      case AnimationState.ON_CAMERA:
        this.onCamera = stateValue;
        break;
    }

    if (!this.onCall && !this.phoneOpen) {
      if (this.animationInterval) {
        clearInterval(this.animationInterval);
        this.animationInterval = null;
      }
    } else if (!this.animationInterval) {
      this.createAnimationInterval();
    }
  }

  private handleCallAnimation(playerPed: number) {
    if (IsPedInAnyVehicle(playerPed, true)) {
      this.handleOnCallInVehicle(playerPed, GetVehicleClass(GetVehiclePedIsIn(playerPed,false)));
    } else {
      this.handleOnCallNormal(playerPed);
    }
  }

  private handleOpenAnimation(playerPed: number) {
    if (IsPedInAnyVehicle(playerPed, true)) {
      this.handleOpenVehicleAnim(playerPed, GetVehicleClass(GetVehiclePedIsIn(playerPed,false)));
    } else {
      this.handleOpenNormalAnim(playerPed);
    }
  }

  private handleCallEndAnimation(playerPed: number) {
    if (IsPedInAnyVehicle(playerPed, true)) {
      this.handleCallEndVehicleAnim(playerPed, GetVehicleClass(GetVehiclePedIsIn(playerPed,false)));
    } else {
      this.handleCallEndNormalAnim(playerPed);
    }
  }

  private handleCloseAnimation(playerPed: number) {
    if (IsPedInAnyVehicle(playerPed, true)) {
      this.handleCloseVehicleAnim(playerPed, GetVehicleClass(GetVehiclePedIsIn(playerPed,false)));
    } else {
      this.handleCloseNormalAnim(playerPed);
    }
  }

  async openPhone(): Promise<void> {
    newPhoneProp();
    if (!this.onCall) {
      this.handleOpenAnimation(PlayerPedId());
    }
    this.setPhoneState(AnimationState.PHONE_OPEN, true);
  }

  async closePhone(): Promise<void> {
    removePhoneProp();
    this.setPhoneState(AnimationState.PHONE_OPEN, false);
    if (!this.onCall) {
      this.handleCloseAnimation(PlayerPedId());
    }
  }

  async startPhoneCall(): Promise<void> {
    this.handleCallAnimation(PlayerPedId());
    this.setPhoneState(AnimationState.ON_CALL, true);
  }

  async endPhoneCall(): Promise<void> {
    this.handleCallEndAnimation(PlayerPedId());
    this.setPhoneState(AnimationState.ON_CALL, false);
  }

  async openCamera() {
    this.setPhoneState(AnimationState.ON_CAMERA, true);
  }

  async closeCamera() {
    this.setPhoneState(AnimationState.ON_CAMERA, false);
  }

  private async loadAnimDict(dict: any) {
    //-- Loads the animation dict. Used in the anim functions.
    RequestAnimDict(dict);
    while (!HasAnimDictLoaded(dict)) {
      await Delay(100);
    }
  }

  private async handleOpenVehicleAnim(playerPed: number, vehicleClass: number): Promise<void> {
    let dict = 'anim@cellphone@in_car@ps';
    let anim = 'cellphone_text_in';
    if (vehicleClass == 8){
      dict = 'cellphone@';
      anim = 'cellphone_text_read_base';
    }
    await this.loadAnimDict(dict);

    if (!IsEntityPlayingAnim(playerPed, dict, anim, 3)) {
      SetCurrentPedWeapon(playerPed, 0xa2719263, true);
      TaskPlayAnim(playerPed, dict, anim, 7.0, -1, -1, 50, 0, false, false, false);
    }
  }

  private async handleOpenNormalAnim(playerPed: number): Promise<void> {
    //While not in a vehicle it will use this dict.
    const dict = 'cellphone@';
    const anim = 'cellphone_text_in';
    await this.loadAnimDict(dict);

    if (!IsEntityPlayingAnim(playerPed, dict, anim, 3)) {
      SetCurrentPedWeapon(playerPed, 0xa2719263, true);
      TaskPlayAnim(playerPed, dict, anim, 8.0, -1, -1, 50, 0, false, false, false);
    }
  }

  private async handleCloseVehicleAnim(playerPed: number, vehicleClass: number): Promise<void> {
    StopAnimTask(playerPed, 'anim@cellphone@in_car@ps', 'cellphone_text_in', 1.0);
    StopAnimTask(playerPed, 'cellphone@', 'cellphone_text_read_base', 1.0); // Do both incase they were on the phone.
    StopAnimTask(playerPed, 'cellphone@', 'cellphone_call_to_text', 1.0);
    removePhoneProp();
  }

  private async handleCloseNormalAnim(playerPed: number): Promise<void> {
    const DICT = 'cellphone@';
    const ANIM = 'cellphone_text_out';
    StopAnimTask(playerPed, DICT, 'cellphone_text_in', 1.0);
    await Delay(100);
    await this.loadAnimDict(DICT);
    TaskPlayAnim(playerPed, DICT, ANIM, 7.0, -1, -1, 50, 0, false, false, false);
    await Delay(200);
    StopAnimTask(playerPed, DICT, ANIM, 1.0);
    removePhoneProp();
  }

  private async handleOnCallInVehicle(playerPed: number, vehicleClass: number): Promise<void> {
    let DICT = 'anim@cellphone@in_car@ps';
    let ANIM = 'cellphone_call_listen_base';
    if (vehicleClass == 8){
      DICT = 'cellphone@';
      ANIM = 'cellphone_call_listen_base';
    }

    if (!IsEntityPlayingAnim(playerPed, DICT, ANIM, 3)) {
      await this.loadAnimDict(DICT);
      TaskPlayAnim(playerPed, DICT, ANIM, 3.0, 3.0, -1, 49, 0, false, false, false);
    }
  }

  private async handleOnCallNormal(playerPed: number): Promise<void> {
    const DICT = 'cellphone@';
    const ANIM = 'cellphone_call_listen_base';
    if (!IsEntityPlayingAnim(playerPed, DICT, ANIM, 3)) {
      await this.loadAnimDict(DICT);
      TaskPlayAnim(playerPed, DICT, ANIM, 3.0, 3.0, -1, 49, 0, false, false, false);
    }
  }

  private async handleCallEndVehicleAnim(playerPed: number, vehicleClass: number): Promise<void> {
    let DICT = 'anim@cellphone@in_car@ps';
    let ANIM = 'cellphone_call_listen_base';
    if (vehicleClass == 8){
      DICT = 'cellphone@';
      ANIM = 'cellphone_call_listen_base';
    }
    StopAnimTask(playerPed, "anim@cellphone@in_car@ps", "cellphone_call_listen_base", 1);
    StopAnimTask(playerPed, "cellphone@", 'cellphone_call_listen_base', 1.0);
    await this.loadAnimDict(DICT);
    TaskPlayAnim(playerPed, DICT, ANIM, 1.3, 5.0, -1, 50, 0, false, false, false);
  }

  private async handleCallEndNormalAnim(playerPed: number): Promise<void> {
    const DICT = 'cellphone@';
    const ANIM = 'cellphone_call_to_text';

    if (IsEntityPlayingAnim(playerPed, 'cellphone@', 'cellphone_call_listen_base', 49)) {
      await this.loadAnimDict(DICT);
      TaskPlayAnim(playerPed, DICT, ANIM, 2.5, 8.0, -1, 50, 0, false, false, false);
    }
  }
}
