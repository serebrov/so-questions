<?php
class ParentClass{
    public static function test() {
        ChildClass::getProtected();
        ChildClass::getPrivate();
    }
}

class ChildClass extends ParentClass{
    private static function getPrivate(){
        echo "ChildClass private";
    }
    protected static function getProtected(){
        echo "ChildClass protected";
    }
}
(new ParentClass)->test();

class SomeClass {
    public static function test() {
        ChildClass::getProtected();
        ChildClass::getPrivate();
    }
}
(new SomeClass)->test();


/* class ParentClass{ */
/*     public static function test($childObj){ */
/*         /1* $childObj::getProtected(); *1/ */
/*         /1* $childObj::getPrivate(); *1/ */
/*         ChildClass::getProtected(); */
/*         ChildClass::getPrivate(); */
/*     } */
/*     private static function getPrivate(){ */
/*         echo "ParentClass private"; */
/*     } */
/*     protected static function getProtected(){ */
/*         echo "ParentClass protected"; */
/*     } */
/* } */

/* class ChildClass extends ParentClass{ */
/*     private static function getPrivate(){ */
/*         echo "ChildClass private"; */
/*     } */
/*     protected static function getProtected(){ */
/*         echo "ChildClass protected"; */
/*     } */
/* } */
/* (new ParentClass)->test(new ChildClass()); */
