---
name: block-vocabulary
description: Reference for all available visual block types when building apps
---

# Block Vocabulary Reference

When building apps, you work with these visual blocks. Each block has a type and fields.
The blocks.json file contains the app structure as a tree of these blocks.

## Layout Blocks

### app_container
The root block. Every app has exactly one.
- `title` (text): The app's name
- `theme` ("light" or "dark"): Color scheme
- Children: screens

### screen
A navigable page in the app.
- `name` (text): Screen identifier (used by navigate actions)
- Children: any layout, display, or input blocks

### row
Arranges children horizontally.
- Children: any layout, display, or input blocks

### column
Arranges children vertically.
- Children: any layout, display, or input blocks

### card
A visual container with optional title and border.
- `title` (text, optional): Card heading
- Children: any layout, display, or input blocks

### scroll_view
A scrollable container for long content.
- Children: any layout, display, or input blocks

## Display Blocks

### text_display
Shows text to the user.
- `content` (text): What to display. Use `${stateKey}` to show live data.
- `size` ("small", "medium", "large", "heading"): Text size
- `bold` (yes/no): Whether text is bold

### image_display
Shows an image.
- `src` (text): Image URL or placeholder name
- `alt` (text): Description for accessibility
- `width` (number, optional): Width in pixels

### list_display
Shows a list from app data.
- `stateKey` (text): Which data list to display
- `itemTemplate` (text): How each item looks. Use `${item}` for the item value.

### badge
A small colored label.
- `text` (text): Badge content
- `color` (text): Badge color

### divider
A horizontal line separator. No fields.

### progress_bar
Shows progress.
- `value` (number): Current progress (0-100)
- `label` (text, optional): Label text

## Input Blocks

### text_input
A text field the user can type in.
- `placeholder` (text): Hint text shown when empty
- `stateKey` (text): Which data field this updates

### button
A clickable button.
- `label` (text): Button text
- `variant` ("primary", "secondary", "danger"): Button style
- Actions: contains action blocks that run when clicked

### toggle
An on/off switch.
- `label` (text): Toggle label
- `stateKey` (text): Which yes/no data field this controls

### select
A dropdown picker.
- `label` (text): Dropdown label
- `stateKey` (text): Which data field this updates
- `options` (text): Comma-separated list of choices

### number_input
A number field.
- `label` (text): Field label
- `stateKey` (text): Which number data field this updates
- `min` (number, optional): Minimum value
- `max` (number, optional): Maximum value

### date_picker
A date selector.
- `label` (text): Field label
- `stateKey` (text): Which data field this updates

## State Blocks

### state_field
Declares a piece of app data.
- `key` (text): Name of the data field
- `type` ("string", "number", "boolean", "list"): What kind of data
- `default` (text): Starting value

### computed_field
Data calculated from other data.
- `key` (text): Name of the computed field
- `expression` (text): How to calculate it (can reference other state keys)

## Action Blocks (go inside button actions)

### set_state
Update a data value.
- `stateKey` (text): Which data to change
- `value` (text): New value. Use `${otherKey}` to reference other data.

### add_to_list
Add an item to a list.
- `listKey` (text): Which list to add to
- `value` (text): What to add

### remove_from_list
Remove an item from a list.
- `listKey` (text): Which list to remove from
- `match` (text): Which item to remove

### toggle_state
Flip a yes/no value.
- `stateKey` (text): Which yes/no data to toggle

### navigate
Go to a different screen.
- `screenName` (text): Which screen to show

### show_message
Show a brief notification.
- `text` (text): Message content
- `type` ("info", "success", "error"): Message style

## Logic Blocks

### if_then
Do something only when a condition is true.
- `condition` (text): What to check (e.g., `${count} > 0`)
- Children (then): Blocks to use when true

### if_then_else
Do one thing when true, another when false.
- `condition` (text): What to check
- Children (then): Blocks when true
- Children (else): Blocks when false

### compare
Compare two values.
- `left` (text): First value
- `operator` ("equals", "not_equals", "greater", "less", "contains")
- `right` (text): Second value

### and_or
Combine conditions.
- `operator` ("and", "or")
- Children: condition blocks to combine

### not
Reverse a condition.
- Children: one condition block

## Function Blocks

### define_function
Create a reusable set of actions.
- `name` (text): Function name
- Children: action blocks that make up the function

### call_function
Run a previously defined function.
- `name` (text): Which function to run

### return_value
Send back a result from a function.
- `value` (text): What to return

## Loop Blocks

### for_each
Do something for every item in a list.
- `listKey` (text): Which list to go through
- `itemName` (text): Name for the current item
- Children: blocks to repeat for each item

### repeat_times
Do something a set number of times.
- `count` (number): How many times to repeat
- Children: blocks to repeat

## Expression Blocks

### math_operation
Calculate a number.
- `left` (text): First number
- `operator` ("add", "subtract", "multiply", "divide", "modulo")
- `right` (text): Second number

### text_join
Combine text values.
- `parts` (text): Comma-separated values to join

### get_state
Get a data value.
- `key` (text): Which data to read

### get_list_item
Get one item from a list.
- `listKey` (text): Which list
- `index` (text): Position (0 = first item)

### list_length
Count items in a list.
- `listKey` (text): Which list to count
