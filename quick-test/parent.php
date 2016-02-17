<?php

// See http://stackoverflow.com/questions/35385426/understand-why-parent-properties-can-be-accessed-from-child-class-but-parent-obj
//
class Application
{
    //Class Objects
    public $Cookie = NULL;
    public $Session = NULL;
    public $TestVariable = "Hello World";

    //Object initialization. Singleton design.
    protected function __construct()
    {
        //Initialize cookie object.
        $this->Cookie = Cookie::getCookie();
    }

    protected function init() {
        //Initialize session object.
        $this->Session = Session::getSession();
    }

    //Returns the singleton instance of The Curator class. Singleton design.
    public static function Initialize()
    {
        static $instance = NULL;

        if($instance === NULL)
        {
            $instance = new static();
            $instance->init();
        }

        return $instance;
    }

   //Singleton design.
   private function __clone() {}

   //Singleton design.
   private function __wakeup() {}
}

class Cookie
{
    //Object initalization. Singleton design.
    protected function __construct()
    {
    }

    //Singleton design.
    private function __clone() {}

    //Singleton design.
    private function __wakeup() {}

    //Returns the singleton instance of the cookie class. Singleton design.
    public static function getCookie()
    {
        static $cookieInstance = NULL;

        if($cookieInstance === NULL)
        {
            $cookieInstance = new static();
        }

        return $cookieInstance;
    }

    //Removes all cookies.
    public function destroyCookies()
    {
        //CODE HERE
    }
}

class Session extends Application
{
    //Object initialization. Singleton design.
    protected function __construct()
    {
        parent::__construct();
        //This FAILS!
        $this->Cookie->destroyCookies();
        //This WORKS!
        echo $this->TestVariable;
    }

    //Singleton design.
    private function __clone() {}

    //Singleton design.
    private function __wakeup() {}

    //Returns the singleton instance of the session class. Singleton design.
    public static function getSession()
    {
        static $sessionInstance = NULL;

        if($sessionInstance === NULL)
        {
            $sessionInstance = new static();
        }

        return $sessionInstance;
    }
}

Session::getSession();
