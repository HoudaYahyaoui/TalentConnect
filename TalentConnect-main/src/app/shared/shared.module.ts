import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar.component';
import { FooterComponent } from './components/footer/footer.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { ChatbotComponent } from './components/chatbot/chatbot.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    NavbarComponent,
    FooterComponent,
    SidebarComponent,
    ChatbotComponent,
  ],
  exports: [NavbarComponent, FooterComponent, SidebarComponent, ChatbotComponent],
})
export class SharedModule {}
