import { Component } from '@angular/core';

@Component({
  selector: 'not-found',
  template: `
<main>
    <header>
        <section class="not-found-header content-padding">
            <h1 class="center app-header-font-lightblue mb-20">Page Not Found</h1>
            <p style="color: white;font-size:20px;">
              To check out our work from home articles, see our <a style="color:cornflowerblue;" href="/blog">blog</a>.
            </p>
        </section>
    </header>

</main>
`,
  standalone: true
})
export class NotFoundComponent {

}
