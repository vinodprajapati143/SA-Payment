import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { ChartReportComponent } from './chart-report/chart-report.component';
import { PenalReportComponent } from './penal-report/penal-report.component';
import { UserDashboardComponent } from './user-dashboard/user-dashboard.component';
import { SharePageComponent } from './share-page/share-page.component';
import { ProfileComponent } from './profile/profile.component';
import { ProfileEditComponent } from './profile-edit/profile-edit.component';
import { AddAmountComponent } from './add-amount/add-amount.component';
import { WithdrawalComponent } from './withdrawal/withdrawal.component';
import { AllGamesComponent } from './all-games/all-games.component';
import { PlayGameComponent } from './play-game/play-game.component';
import { ReportsComponent } from './report/report.component';
import { GameRateComponent } from './game-rate/game-rate.component';
import { BlogsComponent } from './blogs/blogs.component';
import { AboutUsComponent } from './about-us/about-us.component';
import { ContactComponent } from './contact/contact.component';
import { BlogDetalisComponent } from './blog-detalis/blog-detalis.component';

const routes: Routes = [
  // { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'dashboard', component: UserDashboardComponent },
  { path: 'chart-report', component: ChartReportComponent },
  { path: 'today-report', component: PenalReportComponent },
  { path: 'report', component: ReportsComponent },
  { path: 'share', component: SharePageComponent },
  { path: 'profile', component: ProfileComponent },
  { path: 'add-amount', component: AddAmountComponent },
  { path: 'all-games', component: AllGamesComponent },
  { path: 'play', component: PlayGameComponent },
  { path: 'withdrawal', component: WithdrawalComponent },
  { path: 'game-rate', component: GameRateComponent },
  { path: 'blogs', component: BlogsComponent },
  { path: 'blog-detalis/:id', component: BlogDetalisComponent },
  { path: 'about-us', component: AboutUsComponent },
  { path: 'contact', component: ContactComponent },
  

];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserRoutingModule { }
