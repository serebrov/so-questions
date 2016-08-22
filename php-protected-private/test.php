<?php
class ParentClass{
    public function test($childObj){
        $childObj->getProtected();
        $childObj->getPrivate();
    }
    private function getPrivate(){
        echo "ParentClass private";
    }
    protected function getProtected(){
        echo "ParentClass protected";
    }
}
class ChildClass extends ParentClass{
    private function getPrivate(){
        echo "ChildClass private";
    }
    protected function getProtected(){
        echo "ChildClass protected";
    }
}
(new ParentClass)->test(new ChildClass());
