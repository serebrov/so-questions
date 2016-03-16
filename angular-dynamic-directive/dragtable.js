var project = angular.module("dragtable", []);

project.directive('draggable', function($window, $document) {
    function make_draggable(scope, elem) {
        scope.table = elem[0];
        scope.order = [];
        scope.dragRadius2 = 100;

        var headers = [];
        init();

        scope.$on('dragtable.reinit', function() {
            init();
        });

        function init() {
            headers = scope.table.tHead.rows[0].cells;
            for (var i = 0; i < headers.length; i++) {
                scope.order.push(i);
                headers[i].onmousedown = dragStart;
            }
        }

        function dragStart($event) {
            // Prevent default dragging of selected content
            $event.preventDefault();

            // Prepare the drag object
            scope.origNode = $event.target;
            var pos = eventPosition($event);
            // Drag the entire table cell, not just the element that was clicked.
            scope.origNode = findUp(scope.origNode, /T[DH]/);
            scope.startCol = findColumn(scope.table, pos.x);
            if (scope.startCol === -1) {
                return;
            }
            var new_elt = fullCopy(scope.table, false);
            new_elt.style.margin = '0';
            // Copy the entire column
            var copySectionColumn = function(sec, col) {
                var new_sec = fullCopy(sec, false);
                forEach(sec.rows, function(row) {
                    var cell = row.cells[col];
                    var new_tr = fullCopy(row, false);
                    if (row.offsetHeight) {
                        new_tr.style.height = row.offsetHeight + "px";
                    }
                    var new_td = fullCopy(cell, true);
                    if (cell.offsetWidth) {
                        new_td.style.width = cell.offsetWidth + "px";
                    }
                    new_tr.appendChild(new_td);
                    new_sec.appendChild(new_tr);
                });
                return new_sec;
            };
            // First the heading
            if (scope.table.tHead) {
                new_elt.appendChild(copySectionColumn(
                    scope.table.tHead, scope.startCol));
            }
            forEach(scope.table.tBodies, function(tb) {
                new_elt.appendChild(
                    copySectionColumn(
                        tb, scope.startCol));
            });
            if (scope.table.tFoot) {
                new_elt.appendChild(copySectionColumn(
                    scope.table.tFoot, scope.startCol));
            }
            var obj_pos = absolutePosition(scope.origNode, true);
            new_elt.style.position = "absolute";
            new_elt.style.left = obj_pos.x + "px";
            new_elt.style.top = obj_pos.y + "px";
            new_elt.style.width = scope.origNode.offsetWidth + "px";
            new_elt.style.height = scope.origNode.offsetHeight + "px";
            new_elt.style.opacity = 0.7;

            // Hold off adding the element until clearly a drag.
            scope.addedNode = false;
            scope.tableContainer = scope.table.parentNode || $document.body;
            scope.elNode = new_elt;

            // Save starting positions of cursor and element.
            scope.cursorStartX = pos.x;
            scope.cursorStartY = pos.y;
            scope.elStartLeft = parseInt(scope.elNode.style.left, 10);
            scope.elStartTop = parseInt(scope.elNode.style.top,  10);
            if (isNaN(scope.elStartLeft)) {
                scope.elStartLeft = 0;
            }
            if (isNaN(scope.elStartTop)) {
                scope.elStartTop  = 0;
            }
            // Update element's z-index.
            scope.elNode.style.zIndex = ++scope.zIndex;

            // Add listeners for movement
            $document.bind('mousemove', dragMove);
            $document.bind('mouseup', dragEnd);
        }

        function dragMove($event) {
            // Get cursor position with respect to the page.
            var pos = eventPosition($event);

            var dx = scope.cursorStartX - pos.x;
            var dy = scope.cursorStartY - pos.y;
            if (!scope.addedNode && dx * dx + dy * dy > scope.dragRadius2) {
                scope.tableContainer.insertBefore(
                        scope.elNode, scope.table);
                scope.addedNode = true;
            }

            // Move drag element as cursor has moved.
            var style = scope.elNode.style;
            style.left = (scope.elStartLeft + pos.x - scope.cursorStartX) + "px";
            style.top  = (scope.elStartTop  + pos.y - scope.cursorStartY) + "px";
        }

        function dragEnd($event) {
            $document.unbind('mousemove', dragMove);
            $document.unbind('mouseup', dragEnd);

            // If the floating header wasn't added,
            // the mouse didn't move far enough.
            if (!scope.addedNode) {
                return;
            }
            scope.tableContainer.removeChild(scope.elNode);

            // Determine whether the drag ended over the table,
            // and over which column.
            var pos = eventPosition($event);
            var table_pos = absolutePosition(scope.table);
            if (pos.y < table_pos.y ||
                pos.y > table_pos.y + scope.table.offsetHeight) {
                return;
            }
            var targetCol = findColumn(scope.table, pos.x);
            if (targetCol !== -1 && targetCol !== scope.startCol) {
                moveColumn(scope.table,
                           scope.startCol,
                           targetCol);
                scope.onDragEnd({
                    $start: scope.startCol,
                    $target: targetCol
                });
                scope.$apply();
            }
        }

        function moveColumn(table, sIdx, fIdx) {
            var row;
            var i=table.rows.length;
            while (i--) {
                row = table.rows[i];
                var x = row.removeChild(row.cells[sIdx]);
                if (fIdx < row.cells.length) {
                    row.insertBefore(x, row.cells[fIdx]);
                }
                else {
                    row.appendChild(x);
                }
            }

            // For whatever reason
            // sorttable tracks column indices this way.
            var headrow = table.tHead.rows[0].cells;
            var j;
            for (j=0; j<headrow.length; j++) {
                headrow[j].sorttable_columnindex = j;
            }
        }

        function fullCopy(elt, deep) {
            var new_elt = elt.cloneNode(deep);
            new_elt.className = elt.className;
            forEach(elt.style, function(value, key) {
                if (value === null) {
                    return;
                }
                if (typeof(value) === "string" && value.length === 0) {
                        return;
                    }
                new_elt.style[key] = elt.style[key];
            });
            return new_elt;
        }

        function findColumn(table, x) {
            var header = table.tHead.rows[0].cells;
            var i;
            for (i = 0; i < header.length; i++) {
                var pos = absolutePosition(header[i]);
                if (pos.x <= x && x <= pos.x + header[i].offsetWidth){
                    return i;
                }
            }
            return -1;
        }

        function eventPosition($event) {
            return {x: $event.pageX, y: $event.pageY};
        }

        function absolutePosition(elt, stopAtRelative) {
            var ex = 0, ey = 0;
            do {
                var curStyle = $window.getComputedStyle(elt, '');
                if (stopAtRelative && curStyle.position === 'relative') {
                    break;
                } else if (curStyle.position === 'fixed') {
                    // Get the fixed el's offset
                    ex += parseInt(curStyle.left, 10);
                    ey += parseInt(curStyle.top, 10);
                    // Compensate for scrolling
                    ex += $document[0].body.scrollLeft;
                    ey += $document[0].body.scrollTop;
                    // End the loop
                    break;
                } else {
                    ex += elt.offsetLeft;
                    ey += elt.offsetTop;
                }
                elt = elt.offsetParent;
            } while (elt);
            return {x: ex, y: ey};
        }

        function findUp(elt, tag) {
            do {
                if (elt.nodeName &&
                    elt.nodeName.search(tag) !== -1) {
                    return elt;
                }
                elt = elt.parentNode;
            } while (elt);
        }

        function fnForEach(object, block, context) {
            var key;
            for(key in object) {
                if(object.hasOwnProperty(key)){
                    block.call(context, object[key], key, object);
                }
            }
        }

        function strForEach(object, block, context) {
            var array = object.split("");
            var i;
            for (i = 0; i < array.length; i++) {
                block.call(context, array[i], i, array);
            }
        }

        function forEach(object, block, context) {
            if (object) {
                var resolve = Object; // default
                var isObjectFunction = object instanceof Function;
                if (!isObjectFunction && object.forEach instanceof Function) {
                    // the object implements a custom forEach method so use that
                    object.forEach(block, context);
                    return;
                }
                if (isObjectFunction) {
                    // functions have a "length" property
                    resolve = fnForEach;
                } else if (typeof object === "string") {
                    resolve = strForEach;
                } else if (typeof object.length === "number") {
                    // the object is array-like
                    resolve = arForEach;
                }
                resolve(object, block, context);
            }
        }

        function arForEach(array, block, context) {
            // array-like enumeration
            var i;
            for (i = 0; i < array.length; i++) {
                block.call(context, array[i], i, array);
            }
        }

    }

    return {
        restrict: "A",
        scope: {
            onDragEnd: '&'
        },
        link: make_draggable
    };
});
