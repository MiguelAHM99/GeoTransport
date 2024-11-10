import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { UserMapPageRoutingModule } from './user-map-routing.module';
import { UserMapPage } from './user-map.page';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    UserMapPageRoutingModule
  ],
  declarations: [UserMapPage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class UserMapPageModule {}
