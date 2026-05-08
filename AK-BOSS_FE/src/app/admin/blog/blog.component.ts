import { Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { AdminSidebarComponent } from '../../shared/admin/admin-sidebar/admin-sidebar.component';
 
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { BlogResponse, BlogService } from '../../core/services/blog.service';
import { environment } from '../../../environments/environment.prod';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, Router } from '@angular/router';

import { loadCKEditorCloud, CKEditorModule, type CKEditorCloudResult, type CKEditorCloudConfig } from '@ckeditor/ckeditor5-angular';

import type { ClassicEditor, EditorConfig } from 'https://cdn.ckeditor.com/typings/ckeditor5.d.ts';

const LICENSE_KEY =
	'eyJhbGciOiJFUzI1NiJ9.eyJleHAiOjE4MDYwMTkxOTksImp0aSI6ImNhZjhjYTQxLWNkOGItNGNlNS1hYmFmLTMxMmUxYTZiYjg1MiIsInVzYWdlRW5kcG9pbnQiOiJodHRwczovL3Byb3h5LWV2ZW50LmNrZWRpdG9yLmNvbSIsImRpc3RyaWJ1dGlvbkNoYW5uZWwiOlsiY2xvdWQiLCJkcnVwYWwiXSwiZmVhdHVyZXMiOlsiRFJVUCIsIkUyUCIsIkUyVyJdLCJyZW1vdmVGZWF0dXJlcyI6WyJQQiIsIlJGIiwiU0NIIiwiVENQIiwiVEwiLCJUQ1IiLCJJUiIsIlNVQSIsIkI2NEEiLCJMUCIsIkhFIiwiUkVEIiwiUEZPIiwiV0MiLCJGQVIiLCJCS00iLCJGUEgiLCJNUkUiXSwidmMiOiJlMTY5YTFhNyJ9.i8Y4SyO-RVOBRqKGmPmKymUpgYFKKm4aQcvYdnP2FP-87Zir6OPrkji7uTAczfnkft4MISgkhANYImC_BgOaEg';

const cloudConfig = {
	version: '48.0.0'
} satisfies CKEditorCloudConfig;
 
 
 

 

@Component({
  selector: 'app-blog',
  standalone: true,
  imports: [AdminSidebarComponent, CKEditorModule,FormsModule,CommonModule],
  templateUrl: './blog.component.html',
  styleUrl: './blog.component.scss'
})
export class BlogComponent  implements OnInit {
	public Editor: typeof ClassicEditor | null = null;
	public config: EditorConfig | null = null;

	public ngAfterViewInit(): void {
		loadCKEditorCloud(cloudConfig).then(this._setupEditor.bind(this));
	}
 
  public blogContent = '';
  @ViewChild('fileInput') fileInput!: ElementRef;
 
 private _setupEditor(cloud: CKEditorCloudResult<typeof cloudConfig>) {
		const {
			ClassicEditor,
			Autosave,
			Essentials,
			Paragraph,
			Alignment,
			AutoImage,
			Autoformat,
			AutoLink,
			ImageBlock,
			BlockQuote,
			Bold,
			CloudServices,
			Code,
			CodeBlock,
			Emoji,
			FontBackgroundColor,
			FontColor,
			FontFamily,
			FontSize,
			Fullscreen,
			Heading,
			HorizontalLine,
			ImageCaption,
			ImageInsertViaUrl,
			ImageStyle,
			ImageToolbar,
			ImageUpload,
			Indent,
			IndentBlock,
			Italic,
			Link,
			LinkImage,
			List,
			MediaEmbed,
			Mention,
			Strikethrough,
			Subscript,
			Superscript,
			Table,
			TableCaption,
			TableToolbar,
			TextTransformation,
			TodoList,
			Underline,
			BalloonToolbar,
			BlockToolbar
		} = cloud.CKEditor;

		this.Editor = ClassicEditor;
		this.config = {
			root: {
				placeholder: 'Type or paste your content here!',
			 
			},
			toolbar: {
				items: [
					'undo',
					'redo',
					'|',
					'fullscreen',
					'|',
					'heading',
					'|',
					'fontSize',
					'fontFamily',
					'fontColor',
					'fontBackgroundColor',
					'|',
					'bold',
					'italic',
					'underline',
					'strikethrough',
					'subscript',
					'superscript',
					'code',
					'|',
					'emoji',
					'horizontalLine',
					'link',
					'insertImageViaUrl',
					'mediaEmbed',
					'insertTable',
					'blockQuote',
					'codeBlock',
					'|',
					'alignment',
					'|',
					'bulletedList',
					'numberedList',
					'todoList',
					'outdent',
					'indent'
				],
				shouldNotGroupWhenFull: false
			},
			plugins: [
				Alignment,
				Autoformat,
				AutoImage,
				AutoLink,
				Autosave,
				BalloonToolbar,
				BlockQuote,
				BlockToolbar,
				Bold,
				CloudServices,
				Code,
				CodeBlock,
				Emoji,
				Essentials,
				FontBackgroundColor,
				FontColor,
				FontFamily,
				FontSize,
				Fullscreen,
				Heading,
				HorizontalLine,
				ImageBlock,
				ImageCaption,
				ImageInsertViaUrl,
				ImageStyle,
				ImageToolbar,
				ImageUpload,
				Indent,
				IndentBlock,
				Italic,
				Link,
				LinkImage,
				List,
				MediaEmbed,
				Mention,
				Paragraph,
				Strikethrough,
				Subscript,
				Superscript,
				Table,
				TableCaption,
				TableToolbar,
				TextTransformation,
				TodoList,
				Underline
			],
			licenseKey: LICENSE_KEY,
			balloonToolbar: ['bold', 'italic', '|', 'link', '|', 'bulletedList', 'numberedList'],
			blockToolbar: [
				'fontSize',
				'fontColor',
				'fontBackgroundColor',
				'|',
				'bold',
				'italic',
				'|',
				'link',
				'insertTable',
				'|',
				'bulletedList',
				'numberedList',
				'outdent',
				'indent'
			],
			fontFamily: {
				supportAllValues: true
			},
			fontSize: {
				options: [10, 12, 14, 'default', 18, 20, 22],
				supportAllValues: true
			},
			fullscreen: {
				onEnterCallback: container =>
					container.classList.add(
						'editor-container',
						'editor-container_classic-editor',
						'editor-container_include-block-toolbar',
						'editor-container_include-fullscreen',
						'main-container'
					)
			},
			heading: {
				options: [
					{
						model: 'paragraph',
						title: 'Paragraph',
						class: 'ck-heading_paragraph'
					},
					{
						model: 'heading1',
						view: 'h1',
						title: 'Heading 1',
						class: 'ck-heading_heading1'
					},
					{
						model: 'heading2',
						view: 'h2',
						title: 'Heading 2',
						class: 'ck-heading_heading2'
					},
					{
						model: 'heading3',
						view: 'h3',
						title: 'Heading 3',
						class: 'ck-heading_heading3'
					},
					{
						model: 'heading4',
						view: 'h4',
						title: 'Heading 4',
						class: 'ck-heading_heading4'
					},
					{
						model: 'heading5',
						view: 'h5',
						title: 'Heading 5',
						class: 'ck-heading_heading5'
					},
					{
						model: 'heading6',
						view: 'h6',
						title: 'Heading 6',
						class: 'ck-heading_heading6'
					}
				]
			},
			image: {
				toolbar: ['toggleImageCaption', '|', 'imageStyle:alignBlockLeft', 'imageStyle:block', 'imageStyle:alignBlockRight'],
				styles: {
					options: ['alignBlockLeft', 'block', 'alignBlockRight']
				}
			},
			link: {
				addTargetToExternalLinks: true,
				defaultProtocol: 'https://',
				decorators: {
					toggleDownloadable: {
						mode: 'manual',
						label: 'Downloadable',
						attributes: {
							download: 'file'
						}
					}
				}
			},
			mention: {
				feeds: [
					{
						marker: '@',
						feed: [
							/* See: https://ckeditor.com/docs/ckeditor5/latest/features/mentions.html */
						]
					}
				]
			},
			menuBar: {
				isVisible: true
			},
			table: {
				contentToolbar: ['tableColumn', 'tableRow', 'mergeTableCells']
			}
		};
	}
title: string = '';
subDescription: string = '';
selectedFile: File | null = null;
private baseUrl = environment.apiUrl;
isLoading: boolean | undefined;
isEditMode: boolean | undefined;
imagePreview: string | ArrayBuffer | null = null;
showImageModal: boolean = false;
blogId: number | null = null;
private router = inject(Router);

  constructor(private blogService: BlogService, private toastr: ToastrService, private route: ActivatedRoute) { }

  onFileChange(event: any) {
  const file = event.target.files[0];

  if (file) {
    this.selectedFile = file;

    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview = reader.result as string;
    };
    reader.readAsDataURL(file);
  }
}

uploadAdapter(loader: any) {
  return {
    upload: () => {
      return loader.file.then((file: File) => {

        const formData = new FormData();
        formData.append('file', file);

        return fetch(`${this.baseUrl}/api/upload`, {
          method: 'POST',
          body: formData
        })
        .then(res => res.json())
       .then(result => {
        if (!result.url) {
          throw new Error('Upload failed');
        }
        return {
          default: result.url
        };
      });

      });
    }
  };
}
editorInstance: any;
isEditorReady = false;
isDataLoaded = false;

setEditorDataIfReady() {
 
  if (this.isEditorReady && this.isDataLoaded) {
    this.editorInstance.setData(this.blogContent);

    // optional: cursor fix
    const editor = this.editorInstance;
    setTimeout(() => {
      editor.model.change((writer: any) => {
        const root = editor.model.document.getRoot();
        const firstElement = root.getChild(0);

        if (firstElement) {
          writer.setSelection(writer.createPositionAt(firstElement, 0));
        }
      });
    }, 100);
  }
}

onReady(editor: any) {
  this.editorInstance = editor;
  this.isEditorReady = true;

  // upload adapter
  editor.plugins.get('FileRepository').createUploadAdapter = (loader: any) => {
    return this.uploadAdapter(loader);
  };

  this.setEditorDataIfReady(); // 🔥 yaha call karo
}

ngOnInit() {
  const id = this.route.snapshot.paramMap.get('id');

  if (id) {
    this.isEditMode = true;
    this.blogId = +id;
    this.getBlogById(id);
  }
}

getBlogById(id: any) {
  this.blogService.getBlogById(id).subscribe(res => {
    this.title = res.data.title;
    this.subDescription = res.data.subDescription;
    this.selectedFile = null;

    if (res.data.image) {
      this.imagePreview = res.data.image;
    }

    this.blogContent = res.data.description;
    this.isDataLoaded = true;

    this.setEditorDataIfReady(); // 🔥 yaha bhi call karo
  });
}
onSubmit() {
  // ✅ Validation
  if (!this.title || !this.blogContent) {
    this.toastr.warning('Title and description are required');
    return;
  }

  const title = this.title.trim();
  const subDescription = this.subDescription?.trim();
  const description = this.blogContent.trim();

  // ✅ Image validation
  console.log('this.selectedFile: ', this.selectedFile);
if (this.selectedFile instanceof File) {
  const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];

  if (!allowedTypes.includes(this.selectedFile.type)) {
    this.toastr.error('Only JPG, PNG images allowed');
    return;
  }

  if (this.selectedFile.size > 2 * 1024 * 1024) {
    this.toastr.error('Image size should be less than 2MB');
    return;
  }
}

  const formData = new FormData();
  formData.append('title', title);
  formData.append('subDescription', subDescription || '');
  formData.append('description', description);

if (this.selectedFile instanceof File) {
  formData.append('image', this.selectedFile);
}

  this.isLoading = true;

  // 🔥 MAIN LOGIC (yahi important hai)
  const request$ = this.isEditMode
    ? this.blogService.updateBlog(this.blogId!, formData)
    : this.blogService.createBlog(formData);

  request$.subscribe({
    next: (res: BlogResponse) => {
      this.toastr.success(
        res?.message ||
        (this.isEditMode ? 'Blog Updated Successfully 🔥' : 'Blog Created Successfully 🔥')
      );

      // ✅ Reset only for CREATE (edit me nahi)
      if (!this.isEditMode) {
        this.title = '';
        this.subDescription = '';
        this.blogContent = '';
        this.selectedFile = null;
        this.imagePreview = null;
        this.fileInput.nativeElement.value = '';
      }

      this.router.navigate(['/admin/blog-list']); // ✅ go back to list after success 


      this.isLoading = false;
    },

    error: (err) => {
      console.error('Blog Error:', err);

      let errorMessage = 'Something went wrong. Please try again.';

      if (err?.error?.message) {
        errorMessage = err.error.message;
      } else if (err?.status === 0) {
        errorMessage = 'Unable to connect to server';
      } else if (err?.status === 500) {
        errorMessage = 'Internal server error';
      }

      this.toastr.error(errorMessage);
      this.isLoading = false;
    }
  });
}

toggleImageModal() {
  this.showImageModal = !this.showImageModal;
}
}
