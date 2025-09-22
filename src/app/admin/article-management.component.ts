import { Component, OnInit, ChangeDetectionStrategy, viewChild, ElementRef, AfterViewInit, inject, signal, input, ChangeDetectorRef } from "@angular/core";
import { CommonModule, DOCUMENT } from '@angular/common';
import { data } from "../app.data";

import { BlogService } from "../blog.service";
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { AdminBlogData, AmzProduct, BlogData } from "../shared/interfaces/blog-interface";
import { FormsModule } from "@angular/forms";
import type Quill from 'quill';
import type { Delta } from 'quill';

@Component({
  selector: "article-management",
  templateUrl: "./article-management.component.html",
  imports: [
    FormsModule,
    CommonModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class ArticleManagementComponent implements OnInit, AfterViewInit {

  private document: Document | undefined = (typeof document !== 'undefined') ? inject(DOCUMENT) : undefined;

  //NEW Quill stuff
  editor = viewChild.required<ElementRef>('editor');
  user = input.required<string>();
  private quill: Quill | undefined;
  currentArticleContents: Delta | undefined;
  selectedPartnerTag = "";
  // Track a single active features overlay so only one textarea can be open at once
  private currentFeaturesOverlay: { overlay: HTMLElement; featuresEl: HTMLElement; ta: HTMLTextAreaElement } | null = null;
  // toolbar fixed-position helpers
  private _fixedToolbarSpacer: HTMLElement | null = null;
  private _fixedToolbarEl: HTMLElement | null = null;
  private _toolbarListeners: Array<() => void> = [];

  async ngAfterViewInit() {
    // If running on the server (route extraction / SSR) there is no DOM. Skip DOM-only initialization.
    if (typeof document === 'undefined' || typeof window === 'undefined') {
      return;
    }

    try {
      // Dynamically import the Quill library from npm package.
      // This tells the Angular builder to put Quill in a separate, lazy-loadable file.
      const { default: QuillConstructor } = await import('quill');
      // Register a custom block embed blot for Amazon product widgets so Quill preserves the widget HTML
      try {
        const Q = (QuillConstructor) as unknown as { import?: (name: string) => unknown; register?: (blot: unknown) => void } | undefined;
        const BlockEmbedCtor = Q && Q.import ? (Q.import('blots/block/embed') as unknown) : undefined;
        if (BlockEmbedCtor) {
          /* eslint-disable @typescript-eslint/no-explicit-any */
          const BlockEmbed = BlockEmbedCtor as unknown as { new(...args: unknown[]): any };
          // capture component instance for use inside the blot class
          // eslint-disable-next-line @typescript-eslint/no-this-alias
          const self = this;
          class AmzProductBlot extends (BlockEmbed as any) {
            static blotName = 'amz';
            static tagName = 'div';
            static className = 'amz-product-embed';
            static create(value: unknown) {
              const node = super.create();
              const v = value as { asin?: string; html?: string } | undefined;
              if (v?.asin) node.setAttribute('data-asin', v.asin);
              // make the embed and all its children non-editable so it behaves as an atomic block
              node.setAttribute('contenteditable', 'false');
              // If HTML was provided, ensure the HTML is wrapped in a non-editable container.
              // We avoid double-wrapping if the provided HTML already has an outer container with the same class.
              const html = v?.html || '';
              if (html && typeof html === 'string') {
                // Ensure the outer product box is non-editable but the inner features block is editable.
                let injected = html;
                // Add contenteditable="false" to outer product box if present
                injected = injected.replace(/<div([^>]*)class=("|')?amz-product-box("|')?([^>]*)>/i, '<div$1class="amz-product-box"$4 contenteditable="false">');
                // Ensure the features container (if present) is editable so only that area can be changed
                injected = injected.replace(/<div([^>]*)class=("|')?amz-features("|')?([^>]*)>/i, '<div$1class="amz-features"$4 contenteditable="true">');
                node.innerHTML = injected || html;
                // Attach a dblclick handler to open a small prompt for editing features inline
                try {
                  // Replace prompt-based editing with opening the overlay editor. If the features
                  // container does not exist yet, create an empty one so authors can add lines.
                  node.addEventListener('dblclick', (ev) => {
                    ev.stopPropagation();
                    try {
                      let featEl = node.querySelector('.amz-features') as HTMLElement | null;
                      // If no features container exists, create an empty editable container and insert it
                      if (!featEl) {
                        const cont = document.createElement('div');
                        cont.className = 'amz-features';
                        // keep it non-editable inside Quill; overlay will handle editing
                        cont.setAttribute('contenteditable', 'false');
                        // Insert before CTA if possible
                        const content = node.querySelector('.amz-content');
                        if (content) {
                          const cta = content.querySelector('.amz-cta');
                          content.insertBefore(cont, cta ?? null);
                        } else {
                          node.appendChild(cont);
                        }
                        featEl = cont;
                      }
                      // Open our overlay editor for features (overlay handles empty content)
                      try { self.openFeaturesEditor(featEl); } catch { }
                    } catch {
                      // ignore
                    }
                  });
                } catch { }
                // Replace in-place editing with a click-to-open overlay editor to avoid Quill keyboard conflicts.
                try {
                  const featuresEl = node.querySelector('.amz-features') as HTMLElement | null;
                  if (featuresEl) {
                    // Ensure the features container is non-editable inside Quill; open overlay editor
                    // on click or dblclick. If empty, overlay will show a blank textarea for input.
                    featuresEl.setAttribute('contenteditable', 'false');
                    if (!(featuresEl as unknown as Record<string, unknown>)['__amzClickHandler']) {
                      const clickHandler = (ev: MouseEvent) => {
                        ev.stopPropagation();
                        try {
                          // Respect a temporary suppression flag that prevents reopen on overlay close
                          const holder = featuresEl as unknown as Record<string, unknown>;
                          if (holder['__amzSuppressOpen']) return;
                          self.openFeaturesEditor(featuresEl);
                        } catch { }
                      };
                      featuresEl.addEventListener('click', clickHandler as EventListener);
                      featuresEl.addEventListener('dblclick', clickHandler as EventListener);
                      (featuresEl as unknown as Record<string, unknown>)['__amzClickHandler'] = clickHandler as unknown as EventListener;
                    }
                  }
                } catch {
                  // non-fatal
                }
              } else {
                node.innerHTML = '';
              }
              return node;
            }
            static value(node: Element) {
              return { asin: node.getAttribute('data-asin'), html: node.innerHTML };
            }
          }
          if (Q.register) Q.register(AmzProductBlot as unknown);
          /* eslint-enable @typescript-eslint/no-explicit-any */
          console.info('AmzProductBlot registered');
        } else {
          console.info('Quill BlockEmbed not available; AmzProductBlot not registered');
        }
      } catch (err) {
        console.warn('AmzProductBlot registration failed', err);
      }
      const editorEl = this.editor();

      if (!editorEl) {
        throw new Error('Editor element could not be found in the template.');
      }

      this.quill = new QuillConstructor(editorEl.nativeElement, {
        theme: 'snow',
        modules: {
          toolbar: [
            [{ 'header': [1, 2, 3, false] }],
            ['bold', 'italic', 'underline'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            ['link']
          ]
        },
        placeholder: 'Compose something wonderful...',
      });

      // Add a simple custom toolbar button for inserting an Amazon product placeholder.
      try {
        const toolbarModule = this.quill.getModule('toolbar');
        // toolbarModule can be undefined in some environments
        const toolbarContainer = toolbarModule ? (toolbarModule as unknown as { container?: HTMLElement }).container : undefined;
        if (toolbarModule && toolbarContainer) {
          // create a new formats group and append to the end so the button appears at the end
          const doc = this.document!;
          const group = doc.createElement('span');
          group.className = 'ql-formats';

          const amzButton = doc.createElement('button');
          amzButton.type = 'button';
          amzButton.className = 'ql-amz';
          amzButton.title = 'Insert Amazon affiliate link';
          amzButton.setAttribute('aria-label', 'Insert product link');
          // Simple product/tag SVG icon — small and unobtrusive
          amzButton.innerHTML = `
            <svg viewBox="0 0 60 18" width="100%" height="24" preserveAspectRatio="xMidYMid meet" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style="display:block;">
              <!-- Blue AMZ text scaled up to better fill the 24px area -->
              <text x="8" y="9" font-size="16" font-weight="800" fill="currentColor" font-family="Arial, Helvetica, sans-serif" dominant-baseline="middle">AMZ</text>
              <!-- smile curve positioned close beneath the text -->
              <path d="M8 17c5 1.8 14 1.8 18 0" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          `;
          // set a high-contrast Amazon-blue-ish color so the icon is easy to see
          amzButton.style.color = '#146eb4';
          // increase tappable area and visibility
          amzButton.style.padding = '2px 4px';
          amzButton.style.minWidth = '64px';
          amzButton.style.minHeight = '28px';
          amzButton.style.width = '64px';
          amzButton.style.height = '28px';
          // Remove default button inner spacing and ensure svg fills area
          amzButton.style.lineHeight = '1';
          amzButton.style.margin = '0 4px';
          amzButton.style.display = 'inline-flex';
          amzButton.style.alignItems = 'center';
          amzButton.style.justifyContent = 'center';
          amzButton.style.fontSize = '12px';

          amzButton.addEventListener('click', async () => {
            const asin = window.prompt('Enter ASIN to insert');
            if (!asin || !this.quill) return;

            try {
              // Fetch product data for ASIN
              const obs = this.http.post<AmzProduct[]>('/api/product/amz', { ids: [asin] });
              const prods = await lastValueFrom(obs);
              const prod = prods && prods.length > 0 ? prods[0] : undefined;

              const html = this.buildAmzHtml(prod, asin);
              console.log(html);
              const range = this.quill.getSelection(true) || { index: 0, length: 0 };

              // Try to insert as a registered embed first so Quill preserves the widget HTML
              try {
                const quillWithEmbed = this.quill as unknown as { insertEmbed?: (index: number, blot: string, value: unknown, source?: string) => void; setSelection?: (index: number, length: number, source?: string) => void };
                if (quillWithEmbed.insertEmbed) {
                  quillWithEmbed.insertEmbed(range.index, 'amz', { asin, html }, 'user');
                }
                if (quillWithEmbed.setSelection) {
                  quillWithEmbed.setSelection(range.index + 1, 0, 'user');
                }
                // Remove trailing empty paragraph Quill may insert after an embed
                try { this.removeTrailingEmptyParagraphAfterEmbed(asin); } catch { }
                // Ensure any .amz-features elements in the editor have key handlers attached
                this.ensureFeatureHandlersInEditor();
                return;
              } catch {
                // embed insertion failed or blot not registered — fall back to HTML paste
              }

              // 1) Preferred: use clipboard.dangerouslyPasteHTML if available
              const clipboardModule = (this.quill as unknown as { getModule: (name: string) => unknown }).getModule('clipboard') as { dangerouslyPasteHTML?: (index: number, html: string) => void } | undefined;
              if (clipboardModule && typeof clipboardModule.dangerouslyPasteHTML === 'function') {
                clipboardModule.dangerouslyPasteHTML(range.index, html);
                this.ensureFeatureHandlersInEditor();
                try { this.removeTrailingEmptyParagraphAfterEmbed(asin); } catch { }
                return;
              }

              // 2) Fallback: use quill.clipboard.convert to get a Delta and insert at index
              const quillTyped = this.quill as unknown as { clipboard?: { convert?: (html: string) => { ops?: Array<Record<string, unknown>> } } };
              if (quillTyped.clipboard && typeof quillTyped.clipboard.convert === 'function') {
                try {
                  const converted = quillTyped.clipboard.convert(html) as { ops?: Array<Record<string, unknown>> };
                  const ops = converted?.ops ?? [];
                  // Build a delta-like object that retains to the insertion index then inserts the converted ops
                  const deltaToApply: { ops: Array<Record<string, unknown>> } = { ops: [{ retain: range.index }, ...ops] };
                  this.quill.updateContents(deltaToApply as unknown as Delta, 'user');
                  this.ensureFeatureHandlersInEditor();
                  try { this.removeTrailingEmptyParagraphAfterEmbed(asin); } catch { }
                  return;
                } catch {
                  // fall through to placeholder
                }
              }

              // 3) Final fallback: insert raw placeholder text
              this.quill.insertText(range.index, `[[AMZ:${asin}]]`, 'user');
            } catch (err) {
              console.error('Error inserting AMZ widget:', err);
              const range = this.quill.getSelection(true) || { index: 0, length: 0 };
              this.quill.insertText(range.index, `[[AMZ:${asin}]]`, 'user');
            }
          });

          // After toolbar is created in the DOM, make it fixed to the viewport while
          // keeping it visually aligned with the editor. We add a spacer to preserve layout.
          try {
            // Defer to next animation frame so DOM is updated
            requestAnimationFrame(() => {
              try {
                const toolbar = toolbarContainer as HTMLElement;
                const editorWrapper = editorEl.nativeElement as HTMLElement;
                if (!toolbar || !editorWrapper) return;

                // If a previous fixed toolbar exists, remove it
                if (this._fixedToolbarSpacer) {
                  this._fixedToolbarSpacer.remove();
                  this._fixedToolbarSpacer = null;
                }

                // Create spacer to preserve original toolbar height in the layout
                const spacer = document.createElement('div');
                spacer.style.width = '100%';
                spacer.style.height = `${toolbar.offsetHeight}px`;
                toolbar.parentElement?.insertBefore(spacer, toolbar);
                this._fixedToolbarSpacer = spacer;

                // Make a clone reference to the toolbar element we will manage
                this._fixedToolbarEl = toolbar;

                // Compute dimensions and positioning for the toolbar relative to editor
                // Compute left/width from the spacer element so we preserve the
                // exact toolbar visual size and alignment that exists when the
                // toolbar is in-flow. Using the spacer avoids differences caused
                // by wrapper padding or toolbar centering.
                const computeDims = () => {
                  if (this._fixedToolbarSpacer) {
                    const sRect = this._fixedToolbarSpacer.getBoundingClientRect();
                    return { left: sRect.left, width: Math.max(0, sRect.width) };
                  }
                  // Fallback: use editor wrapper as before
                  const rect = editorWrapper.getBoundingClientRect();
                  const paddingLeft = parseFloat(getComputedStyle(editorWrapper).paddingLeft || '0');
                  const paddingRight = parseFloat(getComputedStyle(editorWrapper).paddingRight || '0');
                  const left = rect.left + paddingLeft;
                  const width = Math.max(0, rect.width - (paddingLeft + paddingRight));
                  return { left, width };
                };

                let isFixed = false;
                const topOffset = 0; // px from viewport top when fixed

                const setFixed = () => {
                  if (!this._fixedToolbarEl) return;
                  const { left, width } = computeDims();
                  Object.assign(this._fixedToolbarEl.style, {
                    position: 'fixed',
                    top: `${topOffset}px`,
                    left: `${left}px`,
                    width: `${width}px`,
                    zIndex: '1200',
                    background: '#fff',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.06)'
                  });
                  isFixed = true;
                };

                const unsetFixed = () => {
                  if (!this._fixedToolbarEl) return;
                  // remove inline positioning so it returns to normal flow
                  this._fixedToolbarEl.style.position = '';
                  this._fixedToolbarEl.style.top = '';
                  this._fixedToolbarEl.style.left = '';
                  this._fixedToolbarEl.style.width = '';
                  this._fixedToolbarEl.style.zIndex = '';
                  this._fixedToolbarEl.style.background = '';
                  this._fixedToolbarEl.style.boxShadow = '';
                  isFixed = false;
                };

                // Update toolbar fixed/unfixed state based on scroll position
                const updateToolbarState = () => {
                  if (!this._fixedToolbarEl || !this._fixedToolbarSpacer) return;
                  const toolbarRect = this._fixedToolbarSpacer.getBoundingClientRect();
                  // When the top of the spacer is above the topOffset, fix the toolbar
                  if (toolbarRect.top < topOffset && !isFixed) {
                    setFixed();
                  } else if (toolbarRect.top >= topOffset && isFixed) {
                    unsetFixed();
                  } else if (isFixed) {
                    // still fixed — ensure dimensions are up to date based on spacer
                    const { left, width } = computeDims();
                    Object.assign(this._fixedToolbarEl.style, { left: `${left}px`, width: `${width}px` });
                  }
                };

                // Initialize state (do not force fixed immediately)
                updateToolbarState();

                const onResize = () => updateToolbarState();
                const onScroll = () => updateToolbarState();
                window.addEventListener('resize', onResize);
                window.addEventListener('scroll', onScroll, true);
                this._toolbarListeners.push(() => window.removeEventListener('resize', onResize));
                this._toolbarListeners.push(() => window.removeEventListener('scroll', onScroll, true));
              } catch {
                // silently ignore toolbar pinning errors
              }
            });
          } catch {
            // ignore
          }

          group.appendChild(amzButton);
          // append the new group to the end of the toolbar container
          toolbarContainer.appendChild(group);
        }
      } catch (err) {
        // if running in non-browser or toolbar unavailable, ignore
        console.warn('Could not add product toolbar button', err);
      }
    } catch (error) {
      console.error("Error loading Quill from node_modules:", error);
    }
  }

  // Clean up toolbar listeners and spacer if component is destroyed
  ngOnDestroy() {
    try {
      if (this._fixedToolbarSpacer) {
        this._fixedToolbarSpacer.remove();
        this._fixedToolbarSpacer = null;
      }
      if (this._fixedToolbarEl) {
        // Reset inline styles that were applied
        this._fixedToolbarEl.style.position = '';
        this._fixedToolbarEl.style.top = '';
        this._fixedToolbarEl.style.left = '';
        this._fixedToolbarEl.style.width = '';
        this._fixedToolbarEl.style.zIndex = '';
        this._fixedToolbarEl.style.background = '';
        this._fixedToolbarEl.style.boxShadow = '';
        this._fixedToolbarEl = null;
      }
      // remove any registered listeners
      this._toolbarListeners.forEach((rem) => rem());
      this._toolbarListeners = [];
    } catch {
      // ignore cleanup errors
    }
  }

  // Remove a trailing empty paragraph that Quill inserts after block embeds like ours.
  // This removes the stray <p><br></p> node so the product box doesn't leave an invisible line.
  removeTrailingEmptyParagraphAfterEmbed(asin?: string) {
    try {
      if (!this.quill) return;
      const editorRoot = (this.quill as unknown as { root?: HTMLElement }).root as HTMLElement | undefined;
      if (!editorRoot) return;
      // Find the last embed matching the ASIN (if provided) or any amz embed near the end.
      const selector = typeof asin === 'string' ? `.amz-product-embed[data-asin="${asin}"]` : '.amz-product-embed';
      const nodes = Array.from(editorRoot.querySelectorAll(selector)) as HTMLElement[];
      if (!nodes || nodes.length === 0) return;
      const embedEl = nodes[nodes.length - 1];
      if (!embedEl) return;
      const next = embedEl.nextElementSibling as HTMLElement | null;
      if (!next) return;
      // check for an empty paragraph or a paragraph containing only a <br>
      const html = (next.innerHTML || '').trim().toLowerCase();
      if (next.tagName === 'P' && (html === '' || html === '<br>' || html === '<br/>')) {
        try { next.remove(); } catch { }
      }
    } catch {
      // ignore errors; non-fatal
    }
  }

  // Ensure all .amz-features elements inside the editor have a keydown handler that prevents Backspace/Delete from bubbling
  ensureFeatureHandlersInEditor() {
    try {
      if (!this.quill) return;
      const editorRoot = (this.quill as unknown as { root?: HTMLElement }).root as HTMLElement | undefined;
      if (!editorRoot) return;
      const features = Array.from(editorRoot.querySelectorAll('.amz-features')) as HTMLElement[];
      for (const featuresEl of features) {
        // ensure non-editable inside Quill; show overlay editor on click
        featuresEl.setAttribute('contenteditable', 'false');
        const holder = featuresEl as unknown as { __amzClickHandler?: EventListener };
        if (!holder.__amzClickHandler) {
          const clickHandler = (ev: MouseEvent) => {
            ev.stopPropagation();
            try { this.openFeaturesEditor(featuresEl); } catch { }
          };
          featuresEl.addEventListener('click', clickHandler as EventListener);
          featuresEl.addEventListener('dblclick', clickHandler as EventListener);
          holder.__amzClickHandler = clickHandler as EventListener;
        }
      }

      // Attach a single root-level keydown handler to catch cases where selection spans outside the features element
      const rootHolder = editorRoot as unknown as { __amzRootHandler?: EventListener };
      if (!rootHolder.__amzRootHandler) {
        const rootHandler = (e: KeyboardEvent) => {
          try {
            const sel = window.getSelection();
            if (!sel || sel.rangeCount === 0) return;
            const range = sel.getRangeAt(0);
            // Helper to find enclosing .amz-features ancestor for a node
            const findFeaturesAncestor = (n: Node | null): HTMLElement | null => {
              let cur: Node | null = n;
              while (cur && cur !== editorRoot) {
                if (cur.nodeType === Node.ELEMENT_NODE) {
                  const el = cur as HTMLElement;
                  if (el.classList && el.classList.contains('amz-features')) return el;
                }
                cur = cur.parentNode;
              }
              return null;
            };

            const startFeat = findFeaturesAncestor(range.startContainer);
            const endFeat = range.collapsed ? startFeat : findFeaturesAncestor(range.endContainer);
            if (!startFeat && !endFeat) return; // selection not inside features

            const isModifier = e.ctrlKey || e.metaKey || e.altKey;
            const isPrintable = !isModifier && e.key.length === 1;
            if (isPrintable) {
              // Stop propagation so Quill doesn't handle the typing when selection spans or root is focused
              e.stopPropagation();
              return;
            }

            // For Backspace/Delete, prevent Quill from deleting the embed when selection exists or caret at edges
            if (e.key === 'Backspace' || e.key === 'Delete') {
              // If there's a selection (not collapsed) or caret is at start/end, prevent and stop
              const hasSelection = !range.collapsed;
              if (hasSelection) {
                e.preventDefault();
                e.stopPropagation();
                return;
              }
              // If collapsed, check caret position relative to the features element
              const isCaretAtStart = (() => {
                if (!startFeat) return false;
                const s = window.getSelection();
                if (!s || s.rangeCount === 0) return false;
                const r = s.getRangeAt(0);
                if (!r.collapsed) return false;
                let node: Node | null = r.startContainer;
                const offset = r.startOffset;
                if (node.nodeType === Node.TEXT_NODE) {
                  if ((node.nodeValue?.length ?? 0) > 0 && offset > 0) return false;
                } else {
                  if (offset > 0) return false;
                }
                while (node && node !== startFeat) {
                  if (node.previousSibling) return false;
                  node = node.parentNode;
                }
                return true;
              })();
              const isCaretAtEnd = (() => {
                if (!endFeat) return false;
                const s = window.getSelection();
                if (!s || s.rangeCount === 0) return false;
                const r = s.getRangeAt(0);
                if (!r.collapsed) return false;
                let node: Node | null = r.startContainer;
                const offset = r.startOffset;
                if (node.nodeType === Node.TEXT_NODE) {
                  if ((node.nodeValue?.length ?? 0) > offset) return false;
                } else {
                  if (offset < (node.childNodes?.length ?? 0)) return false;
                }
                while (node && node !== endFeat) {
                  if (node.nextSibling) return false;
                  node = node.parentNode;
                }
                return true;
              })();
              if ((e.key === 'Backspace' && isCaretAtStart) || (e.key === 'Delete' && isCaretAtEnd)) {
                e.preventDefault();
                e.stopPropagation();
                return;
              }
              // otherwise, stop propagation so Quill doesn't act on it
              e.stopPropagation();
            }
          } catch {
            // swallow
          }
        };
        // use capture phase to intercept before Quill
        editorRoot.addEventListener('keydown', rootHandler as EventListener, true);
        rootHolder.__amzRootHandler = rootHandler as EventListener;
      }
      // Attach beforeinput handler to reliably intercept text replacement and deletions
      const beforeHolder = editorRoot as unknown as { __amzBeforeInput?: EventListener };
      if (!beforeHolder.__amzBeforeInput) {
        const beforeHandler = (ev: InputEvent) => {
          try {
            const sel = window.getSelection();
            if (!sel || sel.rangeCount === 0) return;
            const range = sel.getRangeAt(0);
            const findFeaturesAncestor = (n: Node | null): HTMLElement | null => {
              let cur: Node | null = n;
              while (cur && cur !== editorRoot) {
                if (cur.nodeType === Node.ELEMENT_NODE) {
                  const el = cur as HTMLElement;
                  if (el.classList && el.classList.contains('amz-features')) return el;
                }
                cur = cur.parentNode;
              }
              return null;
            };
            const startFeat = findFeaturesAncestor(range.startContainer);
            const endFeat = range.collapsed ? startFeat : findFeaturesAncestor(range.endContainer);
            if (!startFeat && !endFeat) return; // not touching features

            // We need to handle insertText and delete operations ourselves inside the features element
            const inputType = ev.inputType || '';
            const data = ev.data ?? '';
            // Prevent Quill/editor from handling the input when it intersects features
            ev.preventDefault();

            // Compute a local range clamped to the features element
            const targetFeat = startFeat || endFeat as HTMLElement;
            const localRange = document.createRange();
            // Start
            if (startFeat) {
              localRange.setStart(range.startContainer, range.startOffset);
            } else {
              // start at beginning of target
              localRange.setStart(targetFeat, 0);
            }
            // End
            if (endFeat) {
              localRange.setEnd(range.endContainer, range.endOffset);
            } else {
              // end at end of target
              localRange.setEnd(targetFeat, targetFeat.childNodes.length);
            }

            // Ensure the localRange is contained within targetFeat
            try {
              const cmp = targetFeat.compareDocumentPosition(localRange.startContainer as Node);
              // If startContainer is not a descendant, fall back to start of target
              if (!(cmp & Node.DOCUMENT_POSITION_CONTAINED_BY)) {
                localRange.setStart(targetFeat, 0);
              }
            } catch {
              // ignore
            }

            // Perform the edit: delete selected contents then insert data if present
            localRange.deleteContents();
            if (inputType.startsWith('insert') && data) {
              const tn = document.createTextNode(data);
              localRange.insertNode(tn);
              // Move caret after inserted node
              sel.removeAllRanges();
              const r2 = document.createRange();
              r2.setStartAfter(tn);
              r2.collapse(true);
              sel.addRange(r2);
            } else {
              // For delete/backspace we already removed selection; set caret at localRange start
              sel.removeAllRanges();
              const r2 = document.createRange();
              r2.setStart(localRange.startContainer, localRange.startOffset);
              r2.collapse(true);
              sel.addRange(r2);
            }
            // Re-attach per-element handlers just in case
            this.ensureFeatureHandlersInEditor();
          } catch {
            // ignore
          }
        };
        editorRoot.addEventListener('beforeinput', beforeHandler as EventListener, true);
        beforeHolder.__amzBeforeInput = beforeHandler as EventListener;
      }
    } catch {
      // ignore
    }
  }

  //END NEW Quill stuff

  // Open a floating overlay textarea to edit features safely outside Quill's keyboard handling
  openFeaturesEditor(featuresEl: HTMLElement) {
    try {
      // If overlay already exists, switch it to target this featuresEl
      if (this.currentFeaturesOverlay) {
        try {
          const ta = this.currentFeaturesOverlay.ta;
          // Save previous caret/value? We'll replace contents with the current element value
          let currentText = '';
          const ul = featuresEl.querySelector('ul');
          if (ul) {
            currentText = Array.from(ul.querySelectorAll('li')).map(li => li.textContent?.trim() ?? '').join('\n');
          } else {
            currentText = featuresEl.textContent?.trim() ?? '';
          }
          ta.value = currentText;
          // Update stored featuresEl reference
          this.currentFeaturesOverlay.featuresEl = featuresEl;
          // focus
          ta.focus();
          return;
        } catch {
          // fallback to creating new overlay below
          try { this.currentFeaturesOverlay!.overlay.remove(); } catch { }
          this.currentFeaturesOverlay = null;
        }
      }

      // Gather current text
      let currentText = '';
      const ul = featuresEl.querySelector('ul');
      if (ul) {
        currentText = Array.from(ul.querySelectorAll('li')).map(li => li.textContent?.trim() ?? '').join('\n');
      } else {
        currentText = featuresEl.textContent?.trim() ?? '';
      }

      // Create overlay
      const overlay = document.createElement('div');
      overlay.style.position = 'fixed';
      overlay.style.left = '50%';
      overlay.style.top = '50%';
      overlay.style.transform = 'translate(-50%,-50%)';
      overlay.style.zIndex = '99999';
      overlay.style.background = '#fff';
      overlay.style.border = '1px solid #ccc';
      overlay.style.padding = '8px';
      overlay.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
      overlay.style.minWidth = '320px';

      const ta = document.createElement('textarea');
      ta.value = currentText;
      ta.style.width = '560px';
      ta.style.height = '200px';
      ta.style.display = 'block';
      ta.style.marginBottom = '8px';

      const saveBtn = document.createElement('button');
      saveBtn.textContent = 'Save';
      saveBtn.style.marginRight = '8px';
      const cancelBtn = document.createElement('button');
      cancelBtn.textContent = 'Cancel';

      overlay.appendChild(ta);
      overlay.appendChild(saveBtn);
      overlay.appendChild(cancelBtn);
      document.body.appendChild(overlay);

      // Store overlay so no other overlay can be created
      this.currentFeaturesOverlay = { overlay, featuresEl, ta };

      const cleanup = () => {
        try { overlay.remove(); } catch { }
        // temporarily suppress opening handlers on the features element while we remove the overlay
        try { (featuresEl as unknown as Record<string, unknown>)['__amzSuppressOpen'] = true; } catch { }
        try { setTimeout(() => { try { delete (featuresEl as unknown as Record<string, unknown>)['__amzSuppressOpen']; } catch { } }, 200); } catch { }
        this.currentFeaturesOverlay = null;
      };

      saveBtn.addEventListener('click', (ev?: MouseEvent) => {
        try { ev?.stopPropagation(); } catch { }
        try { ev?.preventDefault(); } catch { }
        const lines = ta.value.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
        let newHtml = '';
        if (lines.length > 1) {
          newHtml = `<ul>${lines.map(l => `<li>${this.escapeHtml(l)}</li>`).join('')}</ul>`;
        } else if (lines.length === 1) {
          newHtml = `<p>${this.escapeHtml(lines[0])}</p>`;
        } else {
          newHtml = '';
        }
        featuresEl.innerHTML = newHtml;
        cleanup();
        // reattach handlers
        try { this.ensureFeatureHandlersInEditor(); } catch { }
      });

      cancelBtn.addEventListener('click', (ev?: MouseEvent) => {
        try { ev?.stopPropagation(); } catch { }
        try { ev?.preventDefault(); } catch { }
        cleanup();
      });

      // focus textarea
      ta.focus();
    } catch {
      // ignore
    }
  }

  title = data.aboutData.title;
  selectedRow = 0;

  ar: BlogData = new AdminBlogData();
  blogArticlesSignal = signal<Array<BlogData>>([]);

  // Expose a plain array getter named `blogArticles` so legacy template preprocessor
  // that uses `@for (article of blogArticles; ...)` can read the array value.
  get blogArticles(): Array<BlogData> {
    return this.blogArticlesSignal();
  }

  tags = "";
  savedProducts: Array<AmzProduct> = [];
  partnerTags: Array<string> = [];

  // transient success / error message shown after save or publish
  successVisible = signal(false);
  successMessage = signal('');
  successKind = signal<'success' | 'error'>('success');

  constructor(
    private blogService: BlogService,
    private http: HttpClient,
    private cd: ChangeDetectorRef,
  ) { }

  // Fetch available partner tags for the admin to choose from
  ngOnInit() {
    this.blogService.getPartnerTags().subscribe({
      next: (tags) => {
        // Ensure partnerTags is an array
        this.partnerTags = Array.isArray(tags) ? tags.slice() : [];
        
        if (this.partnerTags.includes(this.user())) {
          this.selectedPartnerTag = this.user();
        }
        this.cd.detectChanges();
      }
    });
  }

  selectArticle(id?: string | undefined) {
    // this.selectedRow = 0;
    if (id) {
      this.ar = this.blogArticles.find(b => b._id === id) as BlogData;
      this.tags = this.ar.tags.join(",");
      this.currentArticleContents = this.ar.article.contents;
      this.quill.setContents(this.currentArticleContents);
    }
    else {
      this.ar = new AdminBlogData();
      this.tags = "";
  // No default partner tag during article creation; allow admin to choose from `partnerTags`.
      this.quill.setContents([]);
    }
  }

  getArticles() {
    this.blogService.getBlogData().subscribe({
      next: blogs => {
        this.blogArticlesSignal.set(blogs);
      },
      error: err => console.log(err),
    });
  }

  saveArticle() {
    //Tags must be comma separated with no spaces
    this.ar.tags = this.tags.replace(/\s/g, "").split(",");
    const nowDate = new Date().toISOString();
    this.ar.articleDate = this.ar.articleDate ?? nowDate;
    this.ar.modifiedDate = nowDate;
    // Persist partner tag selection


    let htmlContent = this.quill?.getSemanticHTML()?.replace(/&nbsp;/g, ' ');
    // If a partner tag is selected, replace any existing Amazon affiliate tag values
    try {
      if (this.selectedPartnerTag && htmlContent) {
        htmlContent = this.replaceAffiliateTagInHtml(htmlContent, this.selectedPartnerTag);
      }
    } catch {
      // ignore and fall back to original htmlContent
    }
    this.ar.article = { contents: this.quill?.getContents(), html: htmlContent };

    this.blogService.saveBlogData(this.ar).subscribe({
      next: res => {
        console.log(res);
        try { this.showTransientMessage('Article saved', 'success'); } catch { }
      },
      error: err => {
        console.log(err);
        try { this.showTransientMessage('Save failed', 'error'); } catch { }
      },
    });
  }

  publishArticle() {
    this.ar.tags = this.tags.replace(/\s/g, "").split(",");
    const nowDate = new Date().toISOString();
    this.ar.articleDate = nowDate;
    this.ar.modifiedDate = nowDate;
    // Persist partner tag selection before publishing
    let htmlContent = this.quill?.getSemanticHTML()?.replace(/&nbsp;/g, ' ');
    try {
      if (this.selectedPartnerTag && htmlContent) {
        htmlContent = this.replaceAffiliateTagInHtml(htmlContent, this.selectedPartnerTag);
      }
    } catch {
      // ignore
    }
    this.ar.article = { contents: this.quill.getContents(), html: htmlContent };
    this.ar.published = true;

    this.blogService.updateBlogData(this.ar).subscribe({
      next: res => {
        console.log(res);
        try { this.showTransientMessage('Article published', 'success'); } catch { }
      },
      error: err => {
        console.log(err);
        try { this.showTransientMessage('Publish failed', 'error'); } catch { }
      },
    });
  }

  // Show a transient toast-like message using signals so OnPush templates update
  showTransientMessage(msg: string, kind: 'success' | 'error' = 'success') {
    try {
      this.successMessage.set(msg);
      this.successKind.set(kind);
      this.successVisible.set(true);
      // auto-hide after 3 seconds
      window.setTimeout(() => {
        try { this.successVisible.set(false); } catch { }
      }, 3000);
    } catch {
      // ignore
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  trackByFn(index: unknown, _item: unknown) {
    return index;
  }

  // Build affiliate HTML on the frontend so the editor shows widgets.
  // Mirrors the server Util.getAmzProductLink logic but performs escaping here.
  buildAmzHtml(prod?: AmzProduct, asin?: string): string {
    // If we don't have product data, insert a simple link placeholder
    if (!prod) {
      const safeAsin = this.escapeHtml(asin ?? '');
      return `<div class="amz-product"><a href="https://www.amazon.com/dp/${safeAsin}" target="_blank" rel="noopener noreferrer">Amazon Product: ${safeAsin}</a></div>`;
    }
    const title = this.escapeHtml(prod.title || 'Product');
    const url = this.escapeHtml(prod.link || `https://www.amazon.com/dp/${asin}`);
    const imgUrl = prod.largeImage?.url || prod.mediumImage?.url || prod.smallImage?.url || '';
    const img = this.escapeHtml(imgUrl);
    //const priceVal = prod.displayPrice ?? (typeof prod.price === 'number' ? `$${prod.price}` : '');
    //const price = this.escapeHtml(String(priceVal ?? ''));

    // image HTML
    const imgHtml = img ? `<img src="${img}" alt="${title}"/>` : '';

    // features HTML: render as a list only when there are more than one feature,
    // otherwise render as a paragraph for a single feature.
    let featuresHtml = '';
    if (Array.isArray(prod.features) && prod.features.length > 0) {
      const features = prod.features.map(f => String(f ?? '').trim()).filter(Boolean);
      if (features.length > 1) {
        // Make the features container editable so authors can tweak bullet points
        featuresHtml = `<div class="amz-features" contenteditable="true"><ul>${features.map(f => `<li>${this.escapeHtml(f)}</li>`).join('')}</ul></div>`;
      } else if (features.length === 1) {
        featuresHtml = `<div class="amz-features" contenteditable="true"><p>${this.escapeHtml(features[0])}</p></div>`;
      }
    }

    // Build a bordered box with image on the left and content on the right. Use .prod-btn for the CTA to match site styles.
    return `
      <div class="amz-product-box" data-asin="${this.escapeHtml(asin ?? '')}" contenteditable="false">
        <div class="amz-image">
          ${imgHtml}
        </div>
        <div class="amz-content">
          <div class="amz-title">${title}</div>
          ${featuresHtml}
          <div class="amz-cta" style="margin-top:auto;">
            <button class="prod-btn" type="button" onclick="window.open('${url}','_blank')">Check it out on Amazon <span class="prod-arrow" aria-hidden="true">→</span></button>
          </div>
        </div>
      </div>
    `;
  }

  private escapeHtml(unsafe: string): string {
    const map: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
      '/': '&#x2F;',
      '`': '&#x60;',
      '=': '&#x3D;'
    };
    return (unsafe || '').replace(/[&<>"'`=\/]/g, (s) => map[s] || '');
  }

  // Replace existing Amazon affiliate tag parameter values in HTML with the provided partnerTag.
  // This searches for tag=VALUE in Amazon URLs and replaces VALUE with partnerTag.
  replaceAffiliateTagInHtml(html: string, partnerTag: string): string {
    try {
      if (!html) return html;
      // Regex to find amazon URLs and replace tag=... part. We replace any tag=... in query string.
      // This will match URLs with http/https and domain amazon.* and replace tag= value.
      return html.replace(/(https?:\/\/[^"'\s]*?amazon\.[^"'\s]*?)([?&][^"'\s]*?)(tag=)([^"'&\s]*)([^"'\s]*)/gi, (m, base, pre, tagKey, oldTag, rest) => {
        // Build new query piece: keep pre (other params) but replace tag value
        // If pre already contains the tag param before, this might duplicate; a safer approach
        // is to replace tag param wherever it appears in the entire HTML string below as a fallback.
        return `${base}${pre}${tagKey}${encodeURIComponent(partnerTag)}${rest}`;
      }).replace(/([?&])tag=[^&"'\s]*/gi, (m, sep) => `${sep}tag=${encodeURIComponent(partnerTag)}`);
    } catch {
      return html;
    }
  }
}
