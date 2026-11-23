# Image Cropper

Picks the part of an image to keep, in the shape of a target size, and saves it in the browser before it uploads.

## Basic Usage

The file upload field uses it when the field sets a crop size. An image picked for the field opens the crop popup, unless it is the shape already.

```yaml
banner:
    label: Banner
    type: fileupload
    mode: image
    cropWidth: 1674
    cropHeight: 696
```

In script, `cropImageFile()` takes a picked file and resolves with the file to upload.

```js
import { cropImageFile } from './controls/image-cropper/image-cropper.js';

const cropped = await cropImageFile(file, {
    width: 1674,
    height: 696,
    template: document.querySelector('#cropTemplate').innerHTML
});

if (cropped) {
    upload(cropped);
}
```

It resolves with:

- the file as it is, when the image is the shape already and no larger than the size
- a copy scaled down to the size, when the image is the shape and larger
- the part picked in the crop popup otherwise
- `null` when the popup is closed without cropping

It rejects when the browser cannot read the file as an image.

## Behavior

- The frame is the shape of the target size. The image always covers it.
- Dragging moves the image, and so do the arrow keys while the frame has focus.
- The mouse wheel zooms on the point under the pointer. The `+` and `-` keys and the popup's slider zoom on the middle.
- The part in the frame is saved at its own size, up to the target size. An image is never made larger than it is.
- A JPEG, PNG or WebP keeps its type where the browser can save it. Anything else is saved as a PNG, and the file's extension changes to match.
- Shapes within one percent of each other count as the same.
- Cropping an animated GIF keeps its first frame. An animated GIF that is the shape and no larger than the size is left as it is.

## Popup Template

The popup's markup comes from a template, so its text can be translated by whatever renders it. The file upload field renders its own, `_crop_template.php`. These attributes mark the parts the script fills in:

| Attribute | Purpose |
| --- | --- |
| `data-cropper-stage` | The element the cropper is drawn in. `data-label` names the frame for screen readers. |
| `data-cropper-zoom` | A range input from 0 to 100. |
| `data-cropper-output` | Shows the size the part is saved at. |
| `data-cropper-small` | Shown while the part is under half the target size, so it may look blurry. |
| `data-cropper-animated` | Shown for an image that loses its animation. |
| `data-cropper-apply` | The button that crops. |

A `data-dismiss="popup"` button closes the popup without cropping. `data-popup-size` on the outer element sets the popup's size.

## The Cropper Alone

`ImageCropper` draws the frame in an element of your own, for a page that brings its own buttons.

```js
import { ImageCropper } from './controls/image-cropper/image-cropper.js';

const cropper = new ImageCropper(element, { width: 1674, height: 696 });

cropper.setImage(image);
```

| Option | Purpose |
| --- | --- |
| `mode` | `frame`, the default, or `select`. See [Select Mode](#select-mode). |
| `width`, `height` | The target size: the shape of the part kept and the largest size it is saved at. |
| `aspectRatio` | In select mode, the shape of the selection as width over height, with no largest size. |
| `maxZoom` | How far the image zooms in frame mode, 4 times by default. |
| `label` | Names the frame for screen readers. |

| Method | Returns |
| --- | --- |
| `setImage(image)` | Shows a loaded image. |
| `setOptions(options)` | Changes the target size or the aspect ratio, and fits the part kept to it. |
| `getSelection()` | The part kept as `{ x, y, width, height }`, in the image's own pixels. |
| `setSelection(selection)` | In select mode, picks a part. It is moved inside the image and fitted to the shape. |
| `getOutputSize()` | The `{ width, height }` the part is saved at. |
| `getZoom()`, `setZoom(value)` | In frame mode, the zoom from 0 to 100. |
| `zoomTo(scale, originX, originY)` | In frame mode, scales the image, keeping a point of the frame in place. |
| `moveBy(x, y)` | Moves the image by a distance in screen pixels, or the selection by a distance in the image's pixels. |
| `toFile(file)` | A promise of the cropped file, named after the given one. |
| `dispose()` | Removes the frame and its listeners. |

The element dispatches `image-cropper:change` whenever the part kept moves or changes size, with `{ cropper, selection, output }` as the detail.

## Select Mode

In select mode the whole image shows, no larger than it is, and a selection is picked over it. Use it where the shape is the person's choice, or where a server does the cropping and only needs to know the part.

```js
const cropper = new ImageCropper(element, { mode: 'select' });

cropper.setImage(image);

element.addEventListener('image-cropper:change', (ev) => {
    const { x, y, width, height } = ev.detail.selection;
});
```

- The selection starts as the whole image, or the largest part of it in the shape.
- Dragging the selection moves it. A corner handle resizes it from the corner opposite, and a side handle moves that side.
- Dragging outside the selection draws a new one. A click there leaves it as it is.
- The arrow keys move the selection one pixel of the image, ten with Shift.
- With `aspectRatio` or a target size, the selection keeps that shape while it is resized.
- `setOptions({ aspectRatio: 16 / 9 })` fits the selection there is to a new shape, and `setOptions({ aspectRatio: null })` frees it.

The frame is as tall as its `max-height` allows, so a page sets that on `.image-cropper-frame` to give the image more room.
