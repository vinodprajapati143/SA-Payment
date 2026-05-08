import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { AddGameComponent } from './add-game/add-game.component';
import { AllGameComponent } from './all-game/all-game.component';
import { BalTransferComponent } from './bal-transfer/bal-transfer.component';
import { BalanceReturnComponent } from './balance-return/balance-return.component';
import { BalWithdrawalComponent } from './bal-withdrawal/bal-withdrawal.component';
import { AllReportComponent } from './all-report/all-report.component';
import { GeneralComponent } from './general/general.component';
import { PaymentMethodComponent } from './payment-method/payment-method.component';
import { PaymentUpdateComponent } from './payment-update/payment-update.component';
import { BlogComponent } from './blog/blog.component';
import { BlogListComponent } from './blog-list/blog-list.component';

const routes: Routes = [
  { path: '', redirectTo: 'users', pathMatch: 'full' },
  { path: 'users', component: AdminDashboardComponent },
  { path: 'add-game', component: AddGameComponent },
  { path: 'all-game', component: AllGameComponent },
  { path: 'bal-transfer', component: BalTransferComponent },
  { path: 'balance-return', component: BalanceReturnComponent },
  { path: 'bal-withdrawal', component: BalWithdrawalComponent },
  { path: 'all-report' , component: AllReportComponent},
  { path: 'general', component: GeneralComponent},
  { path: 'payment-method', component: PaymentMethodComponent},
  { path: 'payment-update', component: PaymentUpdateComponent},
  { path: 'blog', component: BlogComponent},
  { path: 'blog/:id', component: BlogComponent },
  { path: 'blog-list', component: BlogListComponent},

];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
